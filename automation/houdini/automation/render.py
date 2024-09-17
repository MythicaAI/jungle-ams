import os
import hou
import json
import argparse
import time
import mythica.darol as mdarol

def file_or_directory(path):
    if os.path.isfile(path) or os.path.isdir(path):
        return path
    else:
        raise argparse.ArgumentTypeError(f"'{path}' is not a valid file or directory")

description="""
Renderer for HDAs and HIPs. Given an HDA or HIP file this script will render an image of the asset.
"""
parser = argparse.ArgumentParser(description=description)
parser.add_argument(
    "--hda-path",
    required=True,
    type=file_or_directory,
    help="Path of the file or directory of hda/hip files to render. (this path must be accessible inside the Docker container)"
)
parser.add_argument(
    "--output-path",
    type=str,
    help="Output directory for writing out image. (this path must be accessible inside the Docker container)",
)
args, unknown = parser.parse_known_args()
hdapath = args.hda_path

output_path = args.output_path

os.makedirs(output_path, exist_ok=True)

# Gather files
files = []

if os.path.isdir(hdapath):
    for filename in os.listdir(hdapath):
        if filename.endswith('hda') or filename.endswith('hip'):
            files.append(os.path.join(hdapath, filename))
else:
    files.append(hdapath)

# Render files into images
for filepath in files:
    print(f"Processing {filepath}")

    hip = os.path.join(output_path,f'render_{os.path.basename(filepath)}.hip')
    output_image_path = os.path.join(output_path,f"{os.path.basename(filepath)}.png")

    mdarol.start_houdini(hip)

    obj = hou.node('/obj')
    out = hou.node('/out')

    # Geometry
    if (filepath.endswith('hda')):
        hou.hda.installFile(filepath,force_use_assets=True)

        geometry_node = obj.createNode('geo','geometry')
        for assetdef in hou.hda.definitionsInFile(filepath):
            asset = geometry_node.createNode(assetdef.nodeTypeName())
    else:
        hou.hipFile.load(filepath,ignore_load_warnings=True)

    # Gather stats
    stats = dict()

    start = time.time()
    for node in obj.children():
        try:
            node.renderNode().cook()
        except:
            print(f"Failed to cook {filepath}::{node.path()}")

    end = time.time()
    stats['cook_time'] = end - start

    intrinsic_names = {
        "memoryusage",
        "vertexcount",
        "pointcount",
        "primitivecount"
    }
    for name in intrinsic_names:
        value = 0
        for node in obj.children():
            render_node = node.renderNode()
            if (render_node):
                geometry = render_node.geometry()
                if (geometry):
                    value += geometry.intrinsicValue(name)
        stats[name] = value

    # Render Staging
    render_staging = obj.createNode('render_staging')
    render_staging.parm('resx').set(512)
    render_staging.parm('resy').set(512)
    camera_node = render_staging.parm('camera_node')

    # Render
    mantra_node = out.createNode("ifd", "mantra1")
    mantra_node.parm("vm_picture").set(output_image_path)
    mantra_node.parm("camera").set(camera_node)
    mantra_node.parm("vm_verbose").set(1)

    try:
        mantra_node.render(verbose=True, output_progress=True)
    except:
        print(f"Failed to render {filepath}")
    else:
        print(f"Rendered image saved to {output_image_path}")

    # Output stats
    file_json = os.path.join(output_path,f'{os.path.basename(filepath)}_stats.json')
    with open(file_json, "w") as file:
        file.write(json.dumps(stats, indent=2))

    mdarol.end_houdini(hip)
