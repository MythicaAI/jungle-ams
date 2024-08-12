import os
import hou
import json
import argparse
import mythica.darol as mdarol

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
    '--format', 
    required=True,
    choices=['fbx', 'glb'], 
    help="The export format."
)
parser.add_argument(
    '--parms', 
    required=False,
    type=argparse.FileType("r"),
    help="HDA parameters json file."
)   
args, unknown = parser.parse_known_args()
hdapath = args.hda_path.name
parms_path = args.parms.name

output_path = args.output_path

os.makedirs(output_path, exist_ok=True)

hip = os.path.join(output_path,f'export_mesh_{os.path.basename(hdapath)}.hip')

mdarol.start_houdini(hip)

hou.hda.installFile(hdapath,force_use_assets=True)

# Load parameters from file
parms = {}
if args.parms:
    with open(parms_path) as f:
        parms = json.load(f)

# Geometry
obj = hou.node('obj')
geo = obj.createNode('geo','geometry')

for assetdef in hou.hda.definitionsInFile(hdapath):
    asset = geo.createNode(assetdef.nodeTypeName())
    for key, value in parms.items():
        parm = asset.parm(key)
        if parm:
            parm.set(value)

# Export
out = hou.node('out')

if args.format == 'fbx':
    output_file_path = os.path.join(output_path, f"{os.path.basename(hdapath)}.fbx")

    fbx_node = out.createNode("filmboxfbx","fbx_node")
    fbx_node.parm("sopoutput").set(output_file_path)
    fbx_node.parm("exportkind").set(0)  # Export in binary format

    fbx_node.parm("execute").pressButton()
elif args.format == 'glb':
    # gltf vs glb export is inferred from the output extension
    output_file_path = os.path.join(output_path, f"{os.path.basename(hdapath)}.glb")

    gltf_node = out.createNode("gltf","gltf_node")
    gltf_node.parm("file").set(output_file_path)

    gltf_node.parm("execute").pressButton()

mdarol.end_houdini(hip)
