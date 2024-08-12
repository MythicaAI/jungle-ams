import os
import hou
import json
import argparse

description="""
Gather list of node types this HDA depends on. Only outputs types not installed in current context.
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
args, unknown = parser.parse_known_args()
hdapath = args.hda_path.name

output_path = args.output_path

os.makedirs(output_path, exist_ok=True)

hou.hda.installFile(hdapath,force_use_assets=True)

internal = []
external = []

for assetdef in hou.hda.definitionsInFile(hdapath):
    internal.append(f"{assetdef.nodeTypeCategory().name()}/{assetdef.nodeTypeName()}")

    for type in assetdef.nodeType().containedNodeTypes():
        # Parse format: category/namespace::name::version
        tokens = type.split('/')
        if (len(tokens) != 2):
            print(f'Error: Unexpected node type "{type}"')
            continue

        categoryName = tokens[0]
        typeName = tokens[1]

        category = hou.nodeTypeCategories().get(categoryName)
        if category == None:
            print(f'Error: Unexpected category type "{categoryName}"')
            continue

        # Skip types that are installed in the current context
        nodeType = hou.nodeType(category, typeName)
        if nodeType == None:
            external.append(f"{categoryName}/{typeName}")


result = { "internal": internal, "external": external }
output_file = os.path.join(output_path, f"{os.path.basename(hdapath)}.dependencies.json")
with open(output_file, "w") as file:
    file.write(json.dumps(result, indent=2))
