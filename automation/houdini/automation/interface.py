import argparse
import hou
import json
import mythica.network as mnet
import os

def parse_args():
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
    return parser.parse_args()

def interface(hdapath, output_path, output_file_name):
    os.makedirs(output_path, exist_ok=True)

    hou.hda.installFile(hdapath,force_use_assets=True)

    result = []

    for assetdef in hou.hda.definitionsInFile(hdapath):
        type = assetdef.nodeType()
        type_data = mnet.get_node_type(type, False)
        result.append(type_data)

    output_file = os.path.join(output_path, output_file_name)
    with open(output_file, "w") as file:
        file.write(json.dumps(result, indent=2))

    hou.hda.uninstallFile(hdapath)

def main():
    args = parse_args()
    interface(args.hda_path.name, args.output_path, args.output_file_name)

if __name__ == "__main__":
    main()