import os
import hou
import json
from pydantic import BaseModel, Field
from typing import Literal
from pathlib import Path
import mythica.darol as mdarol



class ExportMeshRequest(BaseModel):
    hdapath: Path = Field(..., description="The path to the HDA (Houdini Digital Asset).")
    output_path: Path = Field(..., description="The path where the exported mesh will be saved.")
    output_file_name: str = Field(..., description="The name of the output file.")
    format: Literal['fbx', 'glb', 'usdz'] = Field(..., description="The export format (fbx, glb, usdz).")
    parms_file: Path = Field(..., description="The path to the parameters file.")

    class Config:
        schema_extra = {
            "example": {
                "hdapath": "/path/to/hda/file.hda",
                "output_path": "/path/to/output/",
                "output_file_name": "exported_mesh",
                "format": "fbx",
                "parms_file": "/path/to/parms/file.json"
            }
        }
    
def export_mesh(request: ExportMeshRequest, result_callback):
    hdapath = request.hdapath
    output_path = request.output_path
    output_file_name= request.output_file_name 
    format = request.format, 
    parms_file = request.parms_file

    os.makedirs(output_path, exist_ok=True)

    hip = os.path.join(output_path,f'export_mesh_{os.path.basename(hdapath)}.hip')

    mdarol.start_houdini(hip)

    hou.hda.installFile(hdapath,force_use_assets=True)

    # Load parameters from file
    parms_data = {}
    if parms_file:
        with open(parms_file) as f:
            parms_data = json.load(f)

    # Geometry
    obj = hou.node('obj')
    geo = obj.createNode('geo','geometry')
    stage = hou.node('stage')

    # TODO: Support specifying which definition inside the hda file to use
    assetdef = hou.hda.definitionsInFile(hdapath)[0]
    asset = geo.createNode(assetdef.nodeTypeName())

    # Set parms
    for k, v in parms_data['mesh_parms'].items():
        # TODO: Support ramp parameters
        if not isinstance(v, dict):
            val = [v] if not (isinstance(v, tuple) or isinstance(v, list)) else v
            parm = asset.parmTuple(k)
            if parm:
                parm.set(val)
            else:
                print(f"Parameter {k} not found in {assetdef.nodeTypeName()}")

    # Set inputs
    for i, input_file in enumerate(parms_data['inputs']):
        input_node = None
        if os.path.exists(input_file):
            input_node = geo.createNode('usdimport')
            input_node.parm('filepath1').set(input_file)

            # Load as unpacked polygons
            input_node.parm('input_unpack').set(1)
            input_node.parm('unpack_geomtype').set(1)
        else:
            input_node = geo.createNode('null')

        asset.setInput(i, input_node, 0)

    # Export
    out = hou.node('out')

    if format == 'fbx':
        output_file_path = os.path.join(output_path, f"{output_file_name}.fbx")

        fbx_node = out.createNode("filmboxfbx","fbx_node")
        fbx_node.parm("sopoutput").set(output_file_path)
        fbx_node.parm("exportkind").set(0)  # Export in binary format

        fbx_node.parm("execute").pressButton()
    elif format == 'glb':
        # gltf vs glb export is inferred from the output extension
        output_file_path = os.path.join(output_path, f"{output_file_name}.glb")

        gltf_node = out.createNode("gltf","gltf_node")
        gltf_node.parm("file").set(output_file_path)

        gltf_node.parm("execute").pressButton()
    elif format == 'usdz':
        # Export to USD
        output_file_path = os.path.join(output_path, f"{output_file_name}.usd")
        usd_node = geo.createNode("usdexport","usd_node")
        usd_node.parm("lopoutput").set(output_file_path)
        usd_node.parm("authortimesamples").set("never")
        usd_node.setInput(0, asset, 0)
        usd_node.parm("execute").pressButton()

        # Bind material
        if parms_data['material_parms']['type'] == "Unreal":
            sublayer_node = stage.createNode("sublayer")
            sublayer_node.parm("num_files").set(1)
            sublayer_node.parm("filepath1").set(output_file_path)
    
            sourceAssset = parms_data['material_parms']['sourceAsset']
            attrib_node = stage.createNode("attribwrangle")
            attrib_node.parm("primpattern").set("%type:Boundable")
            attrib_node.parm("snippet").set(f"s@unrealMaterial = '{sourceAssset}';")
            attrib_node.setInput(0, sublayer_node, 0)

            binded_file = os.path.join(output_path, f"{output_file_name}_with_material.usd")
            render_node = stage.createNode("usd_rop")
            render_node.parm("lopoutput").set(binded_file) 
            render_node.setInput(0, attrib_node, 0)
            render_node.parm("execute").pressButton()

            output_file_path = binded_file

        # Convert to USDZ format
        output_zip_file_path = os.path.join(output_path, f"{output_file_name}.usdz")
        usdz_node = out.createNode("usdzip","usdz_node")
        usdz_node.parm("infile1").set(output_file_path)
        usdz_node.parm("outfile1").set(output_zip_file_path)
        usdz_node.parm("execute").pressButton()
        os.remove(output_file_path)

    hou.hda.uninstallFile(hdapath)

    mdarol.end_houdini(hip)
    mdarol.remove_file(hip)

    result_callback({
        'message': f"Mesh generation completed. Output -> {os.path.join(request.output_path,request.output_file_name)}",
        'debug': f"Consider changing the way files are specified in an out given the new interface",
        'houdini_version': f"{hou.applicationName()} - {hou.applicationVersionString()}"
    })