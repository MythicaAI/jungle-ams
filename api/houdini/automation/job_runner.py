import hou
import json
import os
import sys
import time
import mythica.darol as mdarol

def process_job_export_mesh(args):
    print(f"Child: Executing export_mesh job", file=sys.stderr)
    hdapath = args["hda-path"]

    output_path = args["output-path"]
    output_file_name = args["output-file-name"]

    os.makedirs(output_path, exist_ok=True)

    hip = os.path.join(output_path,f'export_mesh_{os.path.basename(hdapath)}.hip')

    mdarol.start_houdini(hip)

    hou.hda.installFile(hdapath,force_use_assets=True)

    # Load parameters from file
    parms = {}
    if args["parms"]:
        with open(args["parms"]) as f:
            parms = json.load(f)

    # Geometry
    obj = hou.node('obj')
    geo = obj.createNode('geo','geometry')

    # TODO: Support specifying which definition inside the hda file to use
    assetdef = hou.hda.definitionsInFile(hdapath)[0]
    asset = geo.createNode(assetdef.nodeTypeName())
    for k, v in parms.items():
        # TODO: Support ramp parameters
        if not isinstance(v, dict):
            val = [v] if not (isinstance(v, tuple) or isinstance(v, list)) else v
            parm = asset.parmTuple(k)
            if parm:
                parm.set(val)
            else:
                print(f"Parameter {k} not found in {assetdef.nodeTypeName()}", file=sys.stderr)

    # Export
    out = hou.node('out')

    if args["format"] == 'fbx':
        output_file_path = os.path.join(output_path, f"{output_file_name}.fbx")

        fbx_node = out.createNode("filmboxfbx","fbx_node")
        fbx_node.parm("sopoutput").set(output_file_path)
        fbx_node.parm("exportkind").set(0)  # Export in binary format

        fbx_node.parm("execute").pressButton()
    elif args["format"] == 'glb':
        # gltf vs glb export is inferred from the output extension
        output_file_path = os.path.join(output_path, f"{output_file_name}.glb")

        gltf_node = out.createNode("gltf","gltf_node")
        gltf_node.parm("file").set(output_file_path)

        gltf_node.parm("execute").pressButton()
    elif args["format"] == 'usdz':
        print(f"Child: Starting bake", file=sys.stderr)

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

        print(f"Child: Finished bake", file=sys.stderr)

    hou.hda.uninstallFile(hdapath)

    mdarol.end_houdini(hip)
    mdarol.remove_file(hip)


def process_job(job):
    print(f"Child: Processing job: {job}", file=sys.stderr)
    if job["type"] == "export_mesh":
        process_job_export_mesh(job["args"])
    else:
        print(f"Child: Unknown job type", file=sys.stderr)
    print(f"Child: Process job completed", file=sys.stderr)

def main():
    parent_to_child_read = int(sys.argv[1])
    child_to_parent_write = int(sys.argv[2])

    print(f"Child: Listening for jobs", file=sys.stderr)
    with os.fdopen(parent_to_child_read) as pipe:
        while True:
            job_data = pipe.readline().strip()
            print(f"Child: Recieved data {job_data}", file=sys.stderr)
            job = json.loads(job_data)
            if job:
                process_job(job)
            else:
                break

            os.write(child_to_parent_write, "Job completed".encode())

    os.close(parent_to_child_read)
    os.close(child_to_parent_write)
    print(f"Child: Closing process", file=sys.stderr)

if __name__ == "__main__":
    main()