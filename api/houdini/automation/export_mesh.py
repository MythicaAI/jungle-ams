import os
import hou
import json
import argparse
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
    parms_data = {}
    if parms_file:
        with open(parms_file) as f:
            parms_data = json.load(f)

    # Geometry
    obj = hou.node('obj')
    geo = obj.createNode('geo','geometry')

    # TODO: Support specifying which definition inside the hda file to use
    assetdef = hou.hda.definitionsInFile(hdapath)[0]
    asset = geo.createNode(assetdef.nodeTypeName())

    # Set parms
    for k, v in parms_data['parms'].items():
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
        usd_node.setInput(0, asset, 0)
        usd_node.parm("execute").pressButton()

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

def main():
    args = parse_args()
    export_mesh(args.hda_path.name, args.output_path, args.output_file_name, args.format, args.parms.name if args.parms else None)

if __name__ == "__main__":
    main()