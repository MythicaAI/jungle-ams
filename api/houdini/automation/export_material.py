import os
import hou
import argparse
import mythica.darol as mdarol

def parse_args():
    """Parse command line arguments and provide the args structure"""

    description="""
    Mateiral generator.
    """
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument(
        "--output-path",
        type=str,
        help="Output directory for writing out the FBX. (this path must be accessible inside the Docker container)",
    )
    return parser.parse_args()

def export_material(output_path):    
    os.makedirs(output_path, exist_ok=True)

    hip = os.path.join(output_path,f'export_material.hip')

    mdarol.start_houdini(hip)

    # Geometry
    obj = hou.node('obj')
    geo = obj.createNode('geo','geometry')

    # Generate material
    generator = geo.createNode('seamless_texture_generator','generator')
    generator.parm("output_path").set(output_path)
    generator.parm("execute").pressButton()

    mdarol.end_houdini(hip)

def main():
    args = parse_args()
    export_material(args.output_path)

if __name__ == "__main__":
    main()