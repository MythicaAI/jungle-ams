import logging
import os
import re
import tempfile
from typing import Optional

import hou
from mythica.network import RampBasis
from opentelemetry import trace
from pydantic import Field

from ripple.automation.publishers import ResultPublisher
from ripple.models.params import FileParameter, ParameterSet
from ripple.models.streaming import Error, OutputFiles

tracer = trace.get_tracer(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

rampkeysVal = {"interp", "pos", "value"}
rampkeysCol = {"interp", "pos", "c"}


def is_ramp_param(param):
    if isinstance(param, list) and all(isinstance(p, dict) for p in param):
        if all(rampkeysVal.issubset(p.keys()) for p in param) or all(rampkeysCol.issubset(p.keys()) for p in param):
            return True
    return False


def apply_single_param(asset, key, value):
    if key == 'nonce':
        return

    if is_ramp_param(value):
        basis = []
        keys = []
        values = []

        # Transpose the dicts into arrays
        for point in value:
            try:
                basis.append(RampBasis[point["interp"]].value)
                keys.append(float(point["pos"]))
                if "value" in point:
                    values.append(float(point["value"]))
                elif "c" in point:
                    values.append(hou.Vector3([float(point["c"][i]) for i in range(3)]))
            except KeyError as e:
                raise ValueError(f"Invalid key in ramp parameter: {e}") from e
            except Exception as e:
                raise ValueError(f"Unexpected error processing ramp parameter: {e}") from e

        # Create and set the ramp
        ramp = hou.Ramp(basis, keys, values)
        asset.parm(key).set(ramp)
    else:
        parm = asset.parmTuple(key)
        if parm:
            if isinstance(parm.parmTemplate(), hou.MenuParmTemplate):
                parm.set([int(value)])
            elif (isinstance(parm.parmTemplate(), hou.StringParmTemplate)
                and parm.parmTemplate().stringType() == hou.stringParmType.FileReference):
                val = value.get('file_path','')
                parm.set([val])
            else:
                val = [value] if not isinstance(value, (tuple, list)) else value
                parm.set(val)


def apply_params(responder, asset, params: dict):
    """Apply all parameters to the graph, raise an error if there is a problem"""
    for key, value in params.items():
        try:
            apply_single_param(asset, key, value)
        except hou.Error as e:
            error_msg = f"Parameter: {key} failed to set: {str(e)}"
            responder.result(Error(error=error_msg))
            raise ValueError(error_msg) from e


def create_inputs(asset, geo, params: dict):
    """
    Create input nodes for the specified asset and geometry network in Houdini, 
    based on file extensions.

    Supports: obj, fbx, gltf/glb, usd/usdz.
    """
    for k, v in params.items():
        # Match keys in the format input<n>
        match = re.search(r'^input(\d+)$', k)
        if not match:
            continue

        input_index = int(match.group(1))
        input_file = v.get('file_path', '')

        # If the file doesn't exist, create a null node
        if not os.path.exists(input_file):
            input_node = geo.createNode('null')
            asset.setInput(input_index, input_node, 0)
            continue

        # Get the file extension (lowercase)
        file_ext = os.path.splitext(input_file)[-1].lower()
        input_node = None

        if file_ext in ['.usd', '.usdz']:
            # Handle USD/USZ files
            input_node = geo.createNode('usdimport')
            input_node.parm('filepath1').set(input_file)

            # Load as unpacked polygons
            input_node.parm('input_unpack').set(1)
            input_node.parm('unpack_geomtype').set(1)

        elif file_ext == '.obj':
            # Handle OBJ files
            input_node = geo.createNode('obj_importer')
            input_node.parm('sObjFile').set(input_file)

        elif file_ext == '.fbx':
            # Handle FBX files
            input_node = geo.createNode('fbx_archive_import')
            input_node.parm('bImportMaterials').set(False)
            input_node.parm('bConvertUnits').set(True)
            input_node.parm('sFBXFile').set(input_file)
            #input_node.parm('bImportAnimation').set(False)
            #input_node.parm('bImportBoneSkin').set(False)
            #input_node.parm('bConvertYUp').set(False)
            #input_node.parm('bUnlockGeo').set(False)
            #input_node.parm('pack').set(False)
            input_node.parm("reload").pressButton()

        elif file_ext in ['.gltf', '.glb']:
            # Handle GLTF/GLB files
            input_node = geo.createNode('gltf')
            input_node.parm('filename').set(input_file)

        else:
            # Unsupported file types: Create a null node
            input_node = geo.createNode('null')
            input_node.setName(f"unsupported_input_{input_index}")

        # Connect the input node to the asset
        asset.setInput(input_index, input_node, 0)


def export_image(asset, working_dir: str, output_file_name: str):
    log.debug("Exporting result as image")

    out = hou.node('out')

    output_file_path = os.path.join(working_dir, f"{output_file_name}.png")

    out_cop = out.createNode("copnet")

    sop_import = out_cop.createNode("sopimport")
    sop_import.parm("usesoppath").set(True)
    sop_import.parm("soppath").set(asset.path())

    geo_to_layer = out_cop.createNode("geotolayer")
    geo_to_layer.parm("signature").set("f3")
    geo_to_layer.setInput(0, sop_import, 0)

    rop_image = out_cop.createNode("rop_image")
    rop_image.parm("coppath").set(geo_to_layer.path())
    rop_image.parm("copoutput").set(output_file_path)

    rop_image.parm("execute").pressButton()
    log.debug("Exporting image completed")

    return [output_file_path]


def export_mesh(asset, geo, working_dir: str, output_file_name: str, format: str):
    log.debug("Exporting result as mesh")

    out = hou.node('out')

    outputs: list[str] = []

    if format == 'fbx':
        output_file_path = os.path.join(working_dir, f"{output_file_name}.fbx")
        outputs.append(output_file_path)

        fbx_node = out.createNode("filmboxfbx", "fbx_node")
        fbx_node.parm("sopoutput").set(output_file_path)
        fbx_node.parm("exportkind").set(0)  # Export in binary format

        log.debug("Exporting FBX %s", output_file_path)
        fbx_node.parm("execute").pressButton()
        log.debug("Exporting mesh completed")
    elif format == 'glb':
        # gltf vs glb export is inferred from the output extension
        output_file_path = os.path.join(working_dir, f"{output_file_name}.glb")
        outputs.append(output_file_path)

        gltf_node = out.createNode("gltf", "gltf_node")
        gltf_node.parm("file").set(output_file_path)

        log.debug("Exporting GLB %s", output_file_path)
        gltf_node.parm("execute").pressButton()
        log.debug("Exporting mesh completed")
    elif format == 'usdz':
        # Export to USD
        usd_node = geo.createNode("usdexport", "usd_node")
        usd_node.parm("authortimesamples").set("never")
        usdz_node = out.createNode("usdzip", "usdz_node")

        for index in range(len(asset.outputNames())):
            output_file_path = os.path.join(working_dir, f"{output_file_name}_{index}.usd")
            usd_node.parm("lopoutput").set(output_file_path)

            log.debug("Exporting USD %s", output_file_path)

            usd_node.setInput(0, asset, 0)
            usd_node.parm("execute").pressButton()
            log.debug("Exporting mesh completed")

            # Convert to USDZ format
            output_zip_file_path = os.path.join(working_dir, f"{output_file_name}_{index}.usdz")
            usdz_node.parm("infile1").set(output_file_path)
            usdz_node.parm("outfile1").set(output_zip_file_path)

            log.debug("Packaging usdz")
            usdz_node.parm("execute").pressButton()
            log.debug("Packaging usdz completed")

            outputs.append(output_zip_file_path)

    return outputs


def generate_mesh_impl(
        hda_path: str,
        hda_definition_index: int,
        format: str,
        params: dict,
        working_dir: str,
        responder: ResultPublisher
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
    geo = obj.createNode('geo', 'geometry')

    assetdef = hou.hda.definitionsInFile(hda_path)[hda_definition_index]
    asset = geo.createNode(assetdef.nodeTypeName())

    # Set parms
    log.debug("Applying parameters")
    apply_params(responder, asset, params)

    log.debug("Creating inputs")
    create_inputs(asset, geo, params)
    log.debug("Setting up scene completed")

    log.debug("Forcing HDA cook (internal HDA cooks must happen before exporting)")
    try:
        asset.cook(force=True)
    except Exception as e:
        log.error(f"Cook failed with exception: {e}")

        error_details = {
            "errors": list(asset.errors()),
            "warnings": list(asset.warnings()),
            "messages": list(asset.messages())
        }
        log.error(f"Cook error details: {error_details}")
        responder.result(Error(error=str(error_details)))
        raise
    log.debug("HDA cook completed")

    # Export
    result_geo = asset.geometry()
    prims = result_geo.prims()
    is_image = len(prims) == 1 and prims[0].type() == hou.primType.Volume

    outputs: list[str] = []
    if is_image:
        outputs = export_image(asset, working_dir, output_file_name)
    else:
        outputs = export_mesh(asset, geo, working_dir, output_file_name, format)

    log.debug("Uninstalling HDA")
    hou.hda.uninstallFile(hda_path)
    log.debug("Uninstalling HDA completed")
    hou.hipFile.clear(suppress_save_prompt=True)
    return outputs


class ExportMeshRequest(ParameterSet):
    hda_file: FileParameter
    hda_definition_index: int
    format: str
    record_profile: Optional[bool] = False


class ExportMeshResponse(OutputFiles):
    files: dict[str, list[str]] = Field(default={"mesh": []})


def generate_mesh(model: ExportMeshRequest, responder: ResultPublisher) -> ExportMeshResponse:
    log.info(f"Starting generate_mesh: {model}")

    if model.record_profile:
        profile = hou.perfMon.startProfile("Generate Mesh Profile")

    tmp_dir = tempfile.mkdtemp()
    result_file_paths = generate_mesh_impl(
        model.hda_file.file_path,
        model.hda_definition_index,
        model.format,
        model.model_dump(exclude={'hda_file', 'hda_definition_index', 'format', 'record_profile'}),
        tmp_dir,
        responder
    )

    if model.record_profile:
        profile.stop()
        profile_path = os.path.join(tmp_dir, "generate_mesh_profile.hperf")
        profile.save(profile_path)

    log.info(f"Completed generate_mesh")
    return ExportMeshResponse(
        files={
            'mesh': [result_file_paths[0]],
            'profile': [profile_path] if model.record_profile else []
        }
    )
