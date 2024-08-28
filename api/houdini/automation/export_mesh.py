import os
import hou
import json
import argparse
import shutil
import mythica.darol as mdarol

def parse_args():
    """Parse command line arguments and provide the args structure"""

    description="""
    Mesh exporter for HDAs. Given an HDA this script will export a mesh of the contained geometry.
    """
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument(
        "--hda-path",
        required=True,
        type=argparse.FileType("r"),
        help="Path of the hda file to export. (this path must be accessible inside the Docker container)"
    )
    parser.add_argument(
        "--output-path",
        type=str,
        help="Output directory for writing out the FBX. (this path must be accessible inside the Docker container)",
    )
    parser.add_argument(
        "--output-file-name",
        type=str,
        required=True,
        help="File name for the output file",
    )
    parser.add_argument(
        '--format', 
        required=True,
        choices=['fbx', 'glb', 'usdz'], 
        help="The export format."
    )
    parser.add_argument(
        '--parms', 
        required=False,
        type=argparse.FileType("r"),
        help="HDA parameters json file."
    )
    return parser.parse_args()

def export_mesh(hdapath, output_path, output_file_name, format, parms_file):    
    os.makedirs(output_path, exist_ok=True)

    hip = os.path.join(output_path,f'export_mesh_{os.path.basename(hdapath)}.hip')

    mdarol.start_houdini(hip)

    hou.hda.installFile(hdapath,force_use_assets=True)

    # Load parameters from file
    parms = {}
    if parms_file:
        with open(parms_file) as f:
            parms = json.load(f)

    # Geometry
    obj = hou.node('obj')
    geo = obj.createNode('geo','geometry')

    # TODO: Support specifying which definition inside the hda file to use
    assetdef = hou.hda.definitionsInFile(hdapath)[0]
    asset = geo.createNode(assetdef.nodeTypeName())
    for k, v in parms['mesh_parms'].items():
        # TODO: Support ramp parameters
        if not isinstance(v, dict):
            val = [v] if not (isinstance(v, tuple) or isinstance(v, list)) else v
            parm = asset.parmTuple(k)
            if parm:
                parm.set(val)
            else:
                print(f"Parameter {k} not found in {assetdef.nodeTypeName()}")

    # Export
    out = hou.node('out')
    stage = hou.node('stage')

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
        temp_dir = os.path.join(output_path, "out")
        os.makedirs(temp_dir, exist_ok=True)

        # Generate mesh
        mesh_file = os.path.join(temp_dir, "mesh.usd")
        usd_node = geo.createNode("usdexport","usd_node")
        usd_node.parm("lopoutput").set(mesh_file)
        usd_node.setInput(0, asset, 0)
        usd_node.parm("execute").pressButton()

        if parms['material_parms'] is not None and len(parms['material_parms']['prompt']) > 0:
            # Generate material
            material_file = os.path.join(temp_dir, "generated.material.usdz")
            generator = geo.createNode('seamless_texture_generator','generator')
            generator.parm("prompt").set(parms['material_parms']['prompt'])
            generator.parm("execute").pressButton()

            # Bind material to the mesh
            sublayer_node = stage.createNode("sublayer", "sublayer_node")
            sublayer_node.parm("num_files").set(2)
            sublayer_node.parm("filepath1").set(mesh_file)
            sublayer_node.parm("filepath2").set(material_file)
    
            assign_node = stage.createNode("assignmaterial", "assign_node")
            assign_node.parm("matspecpath1").set("/materials/principledshader1") 
            assign_node.setInput(0, sublayer_node, 0)

            combined_file = os.path.join(temp_dir, f"combined.usd")
            render_node = stage.createNode("usd_rop", "assign_node")
            render_node.parm("lopoutput").set(combined_file) 
            render_node.setInput(0, assign_node, 0)
            render_node.parm("execute").pressButton()

            mesh_file = combined_file

        # Convert to USDZ format
        output_zip_file_path = os.path.join(output_path, f"{output_file_name}.usdz")
        usdz_node = out.createNode("usdzip","usdz_node")
        usdz_node.parm("infile1").set(mesh_file)
        usdz_node.parm("outfile1").set(output_zip_file_path)
        usdz_node.parm("execute").pressButton()

        # Clean up intermediate files
        shutil.rmtree(temp_dir)

    hou.hda.uninstallFile(hdapath)

    mdarol.end_houdini(hip)
    mdarol.remove_file(hip)

def main():
    args = parse_args()
    export_mesh(args.hda_path.name, args.output_path, args.output_file_name, args.format, args.parms.name if args.parms else None)

if __name__ == "__main__":
    main()