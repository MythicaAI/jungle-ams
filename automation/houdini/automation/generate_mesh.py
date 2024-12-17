import hou
import logging
import os
import re
import tempfile

from ripple.automation import ResultPublisher
from ripple.models.params import ParameterSet, FileParameter
from ripple.models.streaming import OutputFiles
from pydantic import Field
from mythica.network import RampBasis

from opentelemetry import trace


tracer = trace.get_tracer(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

rampkeys = {"interp", "x", "y"}

def is_ramp_param(param):
    if isinstance(param, list) and all(isinstance(p, dict) for p in param):
        if all(rampkeys.issubset(p.keys()) for p in param):
            return True
    return False

def apply_params(asset, params: dict):
    for k, v in params.items():
        if k == 'nonce':
            continue
        
        if is_ramp_param(v):
            basis = []
            keys = []
            values = []

            # Transpose the dicts into arrays
            for point in v:
                try:
                    basis.append(RampBasis[point["interp"]].value)
                    keys.append(float(point["x"]))
                    if isinstance(point["y"], (float, int)):
                        values.append(float(point["y"]))
                    else:
                        values.append(hou.Vector3(point["y"]))
                except KeyError as e:
                    raise ValueError(f"Invalid key in ramp parameter: {e}") from e
                except Exception as e:
                    raise ValueError(f"Unexpected error processing ramp parameter: {e}") from e
            
            # Create and set the ramp
            ramp = hou.Ramp(basis, keys, values)
            asset.parm(k).set(ramp)
        else:
            parm = asset.parmTuple(k)
            if parm:
                val = [v] if not isinstance(v, (tuple, list)) else v
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
) -> list[str]:
    log.debug("Preparing scene")
    output_file_name = os.path.basename(hda_path)

    log.debug("Clearing scene")
    hou.hipFile.clear(suppress_save_prompt=True)

    log.debug("Intalling HDA")
    hou.hda.installFile(hda_path, force_use_assets=True)
    log.debug("Intalling HDA completed")

    # Geometry
    obj = hou.node('obj')
    geo = obj.createNode('geo','geometry')
    stage = hou.node('stage')

    assetdef = hou.hda.definitionsInFile(hda_path)[hda_definition_index]
    asset = geo.createNode(assetdef.nodeTypeName())

    # Set parms
    log.debug("Applying parameters")
    apply_params(asset, params)
    log.debug("Creating inputs")
    create_inputs(asset, geo, params)
    log.debug("Setting up scene completed")

    log.debug("Forcing HDA cook (internal HDA cooks must happen before exporting)")
    try:
        asset.cook(force=True)
    except Exception as e:
        log.error(f"Cook failed with exception: {e}")
        for error in asset.errors():
            log.error(f"Cook Error: {error}")
        for warning in asset.warnings():
            log.error(f"Cook Warning: {warning}")
        for message in asset.messages():
            log.error(f"Cook Message: {message}")
        raise
    log.debug("HDA cook completed")

    # Export
    out = hou.node('out')

    output_file_path = ""
    outputs:list[str] = []
        
    if format == 'fbx':
        outputs.append(os.path.join(working_dir, f"{output_file_name}.fbx"))

        fbx_node = out.createNode("filmboxfbx","fbx_node")
        fbx_node.parm("sopoutput").set(output_file_path)
        fbx_node.parm("exportkind").set(0)  # Export in binary format

        log.debug("Exporting mesh")
        fbx_node.parm("execute").pressButton()
        log.debug("Exporting mesh completed")
    elif format == 'glb':
        # gltf vs glb export is inferred from the output extension
        outputs.append(os.path.join(working_dir, f"{output_file_name}.glb"))

        gltf_node = out.createNode("gltf","gltf_node")
        gltf_node.parm("file").set(output_file_path)

        log.debug("Exporting mesh")
        gltf_node.parm("execute").pressButton()
        log.debug("Exporting mesh completed")
    elif format == 'usdz':
        # Export to USD
        usd_node = geo.createNode("usdexport","usd_node")
        usd_node.parm("authortimesamples").set("never")
        render_node = stage.createNode("usd_rop")
        sublayer_node = stage.createNode("sublayer")
        attrib_node = stage.createNode("attribwrangle")
        usdz_node = out.createNode("usdzip","usdz_node")

        for index in range(len(asset.outputNames())):
            output_file_path = os.path.join(working_dir, f"{output_file_name}_{index}.usd")
            usd_node.parm("lopoutput").set(output_file_path)

            
            usd_node.setInput(0, asset, 0)
            log.debug("Exporting mesh")
            usd_node.parm("execute").pressButton()
            log.debug("Exporting mesh completed")

            # Bind material
            if 'material/type' in params and 'material/source_asset' in params:
                if params['material/type'] == "Unreal":
                    sublayer_node.parm("num_files").set(1)
                    sublayer_node.parm("filepath1").set(output_file_path)
            
                    sourceAssset = params['material/source_asset']
                    attrib_node.parm("primpattern").set("%type:Boundable")
                    attrib_node.parm("snippet").set(f"s@unrealMaterial = '{sourceAssset}';")
                    attrib_node.setInput(0, sublayer_node, 0)

                    binded_file = os.path.join(working_dir, f"{output_file_name}_{index}_with_material.usd")
                    render_node.parm("lopoutput").set(binded_file) 
                    render_node.setInput(0, attrib_node, 0)
                    render_node.parm("execute").pressButton()

                    output_file_path = binded_file

            # Convert to USDZ format
            output_zip_file_path = os.path.join(working_dir, f"{output_file_name}_{index}.usdz")
            usdz_node.parm("infile1").set(output_file_path)
            usdz_node.parm("outfile1").set(output_zip_file_path)

            log.debug("Packaging usdz")
            usdz_node.parm("execute").pressButton()
            log.debug("Packaging usdz completed")

            outputs.append(output_zip_file_path)

    log.debug("Uninstalling HDA")
    hou.hda.uninstallFile(hda_path)
    log.debug("Uninstalling HDA completed")
    hou.hipFile.clear(suppress_save_prompt=True)
    return outputs


class ExportMeshRequest(ParameterSet):
    hda_file: FileParameter
    hda_definition_index: int
    format: str

class ExportMeshResponse(OutputFiles):
    files: dict[str, list[str]] = Field(default={"mesh": []})

def generate_mesh(model: ExportMeshRequest, responder: ResultPublisher) -> ExportMeshResponse:
    log.info(f"Starting generate_mesh: {model}")

    tmp_dir = tempfile.mkdtemp()
    result_file_paths = generate_mesh_impl(
        model.hda_file.file_path,
        model.hda_definition_index,
        model.format,
        model.model_dump(exclude={'hda_file', 'hda_definition_index', 'format'}),
        tmp_dir
    )

    log.info(f"Completed generate_mesh")
    return ExportMeshResponse(
        files = {'mesh': [result_file_paths[0]]}
    )