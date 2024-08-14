import os
import hou
import json
import argparse

description="""
Outputs the interface information for how to use an HDA.
"""
parser = argparse.ArgumentParser(description=description)
parser.add_argument(
    "--hda-path",
    required=True,
    type=argparse.FileType("r"),
    help="Path of the hda file to process. (this path must be accessible inside the Docker container)"
)
parser.add_argument(
    "--output-path",
    type=str,
    help="Output directory for writing out the file metadata. (this path must be accessible inside the Docker container)",
)
parser.add_argument(
    "--output-file-name",
    type=str,
    required=True,
    help="File name for the output file",
)
args, unknown = parser.parse_known_args()
hdapath = args.hda_path.name

output_path = args.output_path
output_file_name = args.output_file_name

os.makedirs(output_path, exist_ok=True)

hou.hda.installFile(hdapath,force_use_assets=True)

parameters = []

for assetdef in hou.hda.definitionsInFile(hdapath):
    type = assetdef.nodeType()

    for parm in type.parmTemplates():
        if parm.type() == hou.parmTemplateType.Float and parm.numComponents() == 1:
            parameters.append({
                "name": parm.name(),
                "label": parm.label(),
                "default": parm.defaultValue()[0]
            })

interface_data = {
    "parameters": parameters
}

output_file = os.path.join(output_path, output_file_name)
with open(output_file, "w") as file:
    file.write(json.dumps(interface_data, indent=2))
