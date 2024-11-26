import hou
import logging
import os
import re
import tempfile

from ripple.automation import ResultPublisher
from ripple.models.params import ParameterSet, FileParameter
from ripple.models.streaming import OutputFiles


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)


def apply_params(asset, params: dict):
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
        input_file = v.get('file_path', '')

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

def generate_mesh_impl(
    hda_path: str,
    hda_definition_index: int,
    format: str,
    params: dict,
    working_dir: str
) -> str:
    log.info("Preparing scene")
    output_file_name = os.path.basename(hda_path)

    log.info("Clearing scene")
    hou.hipFile.clear(suppress_save_prompt=True)

    log.info("Intalling HDA")
    hou.hda.installFile(hda_path, force_use_assets=True)
    log.info("Intalling HDA completed")

    # Geometry
    obj = hou.node('obj')
    geo = obj.createNode('geo','geometry')
    stage = hou.node('stage')

    assetdef = hou.hda.definitionsInFile(hda_path)[hda_definition_index]
    asset = geo.createNode(assetdef.nodeTypeName())

    # Set parms
    log.info("Applying parameters")
    apply_params(asset, params)
    log.info("Creating inputs")
    create_inputs(asset, geo, params)
    log.info("Setting up scene completed")

    log.info("Forcing HDA cook (internal HDA cooks must happen before exporting)")
    asset.cook(force=True)
    log.info("HDA cook completed")

    # Export
    out = hou.node('out')

    output_file_path = ""
    if format == 'fbx':
        output_file_path = os.path.join(working_dir, f"{output_file_name}.fbx")

        fbx_node = out.createNode("filmboxfbx","fbx_node")
        fbx_node.parm("sopoutput").set(output_file_path)
        fbx_node.parm("exportkind").set(0)  # Export in binary format

        log.info("Exporting mesh")
        fbx_node.parm("execute").pressButton()
        log.info("Exporting mesh completed")
    elif format == 'glb':
        # gltf vs glb export is inferred from the output extension
        output_file_path = os.path.join(working_dir, f"{output_file_name}.glb")

        gltf_node = out.createNode("gltf","gltf_node")
        gltf_node.parm("file").set(output_file_path)

        log.info("Exporting mesh")
        gltf_node.parm("execute").pressButton()
        log.info("Exporting mesh completed")
    elif format == 'usdz':
        # Export to USD
        output_file_path = os.path.join(working_dir, f"{output_file_name}.usd")
        usd_node = geo.createNode("usdexport","usd_node")
        usd_node.parm("lopoutput").set(output_file_path)
        usd_node.parm("authortimesamples").set("never")
        usd_node.setInput(0, asset, 0)
        log.info("Exporting mesh")
        usd_node.parm("execute").pressButton()
        log.info("Exporting mesh completed")

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

        log.info("Packaging usdz")
        usdz_node.parm("execute").pressButton()
        log.info("Packaging usdz completed")

        output_file_path = output_zip_file_path

    log.info("Uninstalling HDA")
    hou.hda.uninstallFile(hda_path)
    log.info("Uninstalling HDA completed")
    hou.hipFile.clear(suppress_save_prompt=True)
    return output_file_path


class ExportMeshRequest(ParameterSet):
    hda_file: FileParameter
    hda_definition_index: int
    format: str



def generate_mesh(model: ExportMeshRequest, responder: ResultPublisher) -> OutputFiles:
    log.info(f"Starting generate_mesh: {model}")

    tmp_dir = tempfile.mkdtemp()
    result_file_path = generate_mesh_impl(
        model.hda_file.file_path,
        model.hda_definition_index,
        model.format,
        model.model_dump(exclude={'hda_file', 'hda_definition_index', 'format'}),
        tmp_dir
    )

    log.info(f"Completed generate_mesh")
    return OutputFiles(
        files = {'mesh': [result_file_path]}
    )