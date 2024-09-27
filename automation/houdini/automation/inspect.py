import os
import hou
import json
import argparse
import mythica.darol as mdarol
import mythica.network as mnet

description="""
Node inspector for HDAs. Given an HDA this script will output information about the HDA and assets it contains. 
"""
parser = argparse.ArgumentParser(description=description)
parser.add_argument(
    "--hda-path",
    required=True,
    type=argparse.FileType("r"),
    help="Path of the hda file to inspect. (this path must be accessible inside the Docker container)"
)
parser.add_argument(
    "--output-path",
    type=str,
    help="Output directory for writing out file metadata. (this path must be accessible inside the Docker container)",
)

args, unknown = parser.parse_known_args()
hdapath = args.hda_path.name

output_path = args.output_path

os.makedirs(output_path, exist_ok=True)
hda_file = os.path.basename(hdapath)
hip = os.path.join(output_path,f'inspect_{hda_file}.hip')


mdarol.start_houdini(hip)

hou.hda.installFile(hdapath,force_use_assets=True)

obj = hou.node('obj')

for assetdef in hou.hda.definitionsInFile(hdapath):
    #get the node type for the asset
    nodeType = assetdef.nodeType()
    nt = mnet.get_node_type(nodeType)
    #Generate the nodetype class definitions
    mnet.get_litegraph_class(nt,output_path,output_path,'')  

    #create an appropriate container for it
    container = mdarol.create_container_for_nodetype(nodeType,obj)

    #now create the asset and cook it
    asset = container.createNode(assetdef.nodeTypeName())
    asset.moveToGoodPosition()
    asset.cook() 

    #Generate network for the HDA asset. 
    litegraph_net = mnet.get_network(asset, traverse_subnet=True, traverse_hda=True)
    with open(os.path.join(output_path,f"{hda_file}.{asset.name()}.litegraph.json"), "w", encoding="utf-8") as file:
        file.write(litegraph_net)


mdarol.end_houdini(hip)
mdarol.remove_file(hip)
