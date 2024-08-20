import hou
import json
import os
import mythica.darol as mdarol

def export_mesh(args):
    hdapath = args["hda-path"]
    output_path = args["output-path"]
    output_file_name = args["output-file-name"]
    format = args["format"]
    parms_file = args["parms"]

    os.makedirs(output_path, exist_ok=True)

    hip = os.path.join(output_path,f'export_mesh_{os.path.basename(hdapath)}.hip')

    mdarol.start_houdini(hip)

    hou.hda.installFile(hdapath,force_use_assets=True)

    # Load parameters from file
    parms = {}
    if parms_file:
        with open(parms_file) as f:
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
                print(f"Parameter {k} not found in {assetdef.nodeTypeName()}")

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
        print(f"Child: Starting bake")

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

        print(f"Child: Finished bake")

    hou.hda.uninstallFile(hdapath)

    mdarol.end_houdini(hip)
    mdarol.remove_file(hip)