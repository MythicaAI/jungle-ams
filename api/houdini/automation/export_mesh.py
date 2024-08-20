import os
import hou
import json
import argparse
import mythica.darol as mdarol
from actions import export_mesh

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
args, unknown = parser.parse_known_args()
hdapath = args.hda_path.name

output_path = args.output_path
output_file_name = args.output_file_name

args = {
    "hda-path": hdapath,
    "output-path": output_path,
    "output-file-name": output_file_name,
    "format": args.format,
    "parms": args.parms
}
export_mesh(args)
