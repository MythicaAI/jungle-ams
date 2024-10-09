import hou
import logging
import mythica.darol as mdarol
import os
import re
import requests
import tempfile

from pydantic import BaseModel
from ripple.models.params import ParameterSet, FileParameter

#TODO: Configure elsewhere
ENDPOINT = "https://api.mythica.ai/v1"


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)


def apply_params(asset, params: dict):
    # TODO: Disambiguate between request and HDA parameters
    for k, v in params.items():
        parm = asset.parmTuple(k)
        if parm:
            val = [v] if not (isinstance(v, tuple) or isinstance(v, list)) else v
            parm.set(val)


def create_inputs(asset, geo, params: dict):
    for k, v in params.items():
        match = re.search(r'^input(\d+)$', k)
        if not match:
            continue

        input_index = int(match.group(1))
        input_file = v.file_path

        input_node = None
        if os.path.exists(input_file):
            input_node = geo.createNode('usdimport')
            input_node.parm('filepath1').set(input_file)

            # Load as unpacked polygons
            input_node.parm('input_unpack').set(1)
            input_node.parm('unpack_geomtype').set(1)
        else:
            input_node = geo.createNode('null')

        asset.setInput(input_index, input_node, 0)


def generate_mesh(
    hda_path: str,
    hda_definition_index: int,
    format: str,
    params: dict,
    working_dir: str
) -> str:
    output_file_name = os.path.basename(hda_path)
    hip = os.path.join(working_dir, f'export_mesh_{output_file_name}.hip')

    mdarol.start_houdini(hip)

    hou.hda.installFile(hda_path, force_use_assets=True)

    # Geometry
    obj = hou.node('obj')
    geo = obj.createNode('geo','geometry')
    stage = hou.node('stage')

    assetdef = hou.hda.definitionsInFile(hda_path)[hda_definition_index]
    asset = geo.createNode(assetdef.nodeTypeName())

    # Set parms
    apply_params(asset, params)
    create_inputs(asset, geo, params)

    # Export
    out = hou.node('out')

    output_file_path = ""
    if format == 'fbx':
        output_file_path = os.path.join(working_dir, f"{output_file_name}.fbx")

        fbx_node = out.createNode("filmboxfbx","fbx_node")
        fbx_node.parm("sopoutput").set(output_file_path)
        fbx_node.parm("exportkind").set(0)  # Export in binary format

        fbx_node.parm("execute").pressButton()
    elif format == 'glb':
        # gltf vs glb export is inferred from the output extension
        output_file_path = os.path.join(working_dir, f"{output_file_name}.glb")

        gltf_node = out.createNode("gltf","gltf_node")
        gltf_node.parm("file").set(output_file_path)

        gltf_node.parm("execute").pressButton()
    elif format == 'usdz':
        # Export to USD
        output_file_path = os.path.join(working_dir, f"{output_file_name}.usd")
        usd_node = geo.createNode("usdexport","usd_node")
        usd_node.parm("lopoutput").set(output_file_path)
        usd_node.parm("authortimesamples").set("never")
        usd_node.setInput(0, asset, 0)
        usd_node.parm("execute").pressButton()

        # Bind material
        if 'material/type' in params and 'material/source_asset' in params:
            if params['material/type'] == "Unreal":
                sublayer_node = stage.createNode("sublayer")
                sublayer_node.parm("num_files").set(1)
                sublayer_node.parm("filepath1").set(output_file_path)
        
                sourceAssset = params['material/source_asset']
                attrib_node = stage.createNode("attribwrangle")
                attrib_node.parm("primpattern").set("%type:Boundable")
                attrib_node.parm("snippet").set(f"s@unrealMaterial = '{sourceAssset}';")
                attrib_node.setInput(0, sublayer_node, 0)

                binded_file = os.path.join(working_dir, f"{output_file_name}_with_material.usd")
                render_node = stage.createNode("usd_rop")
                render_node.parm("lopoutput").set(binded_file) 
                render_node.setInput(0, attrib_node, 0)
                render_node.parm("execute").pressButton()

                output_file_path = binded_file

        # Convert to USDZ format
        output_zip_file_path = os.path.join(working_dir, f"{output_file_name}.usdz")
        usdz_node = out.createNode("usdzip","usdz_node")
        usdz_node.parm("infile1").set(output_file_path)
        usdz_node.parm("outfile1").set(output_zip_file_path)
        usdz_node.parm("execute").pressButton()

    hou.hda.uninstallFile(hda_path)

    mdarol.end_houdini(hip)

    return output_file_path


def upload_mesh(token: str, file_path: str) -> str:
    headers = {"Authorization": "Bearer %s" % token}

    file_id = None
    with open(file_path, 'rb') as file:
        file_name = os.path.basename(file_path)
        file_data = [
            ('files', (file_name, file, 'application/octet-stream'))]
        response = requests.post(
            f"{ENDPOINT}/upload/store",
            headers=headers, files=file_data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            file_id = result['files'][0].file_id

    return file_id


class ExportMeshRequest(BaseModel):
    hda_file: FileParameter
    hda_definition_index: int
    format: str


def export_mesh(request: ParameterSet, result_callback):
    model = ExportMeshRequest(**request.params)

    result_file_id = None

    with tempfile.TemporaryDirectory() as tmp_dir:
        result_file_path = generate_mesh(
            model.hda_file.file_path,
            model.hda_definition_index,
            model.format,
            request.params,
            tmp_dir
        )

        # TODO: Pipe through profile_id to create session token
        token = "xxxxxxxxx"

        result_file_id = upload_mesh(token, result_file_path)

    result_callback({
        'message': f"Mesh generation completed. Uploaded {result_file_id}.",
        'houdini_version': f"{hou.applicationName()} - {hou.applicationVersionString()}"
    })
