import os
import hou
import json
import argparse
import random
import mythica.darol as mdarol

def clamp(n, min_value, max_value):
    return max(min_value, min(n, max_value))

# Methods
# 0: No-op
# 1: Completely random
# 2: Random multiplier of current value
# 3: Random offset of current value
randomization_method = 2
verbose = 0

description="""
Generates a HIP containing variations of the input HDA or HIP.
"""
parser = argparse.ArgumentParser(description=description)
parser.add_argument(
    "--hda-path",
    required=True,
    type=argparse.FileType("r"),
    help="Path of the hda or hip file to process. (this path must be accessible inside the Docker container)"
)
parser.add_argument(
    "--output-path",
    type=str,
    help="Output directory for writing out the result hip. (this path must be accessible inside the Docker container)",
)
parser.add_argument(
    "--count",
    required=True,
    type=int,
    help="Number of variations to generate.",
)
parser.add_argument(
    "--strength",
    default=0.2,
    type=float,
    help="How much the generated variations should different from the original.",
)
args, unknown = parser.parse_known_args()
hdapath = args.hda_path.name
output_path = args.output_path
count = args.count
strength = args.strength

os.makedirs(output_path, exist_ok=True)

hip = os.path.join(output_path,f'variation_{os.path.basename(hdapath)}.hip')

mdarol.start_houdini(hip)

obj = hou.node('/obj')

# Load geometry
if (hdapath.endswith('hda')):
    hou.hda.installFile(hdapath,force_use_assets=True)

    geometry_node = obj.createNode('geo','geometry')
    for assetdef in hou.hda.definitionsInFile(hdapath):
        asset = geometry_node.createNode(assetdef.nodeTypeName())
else:
    hou.hipFile.load(hdapath,ignore_load_warnings=True)

# Select node to create variations for
target_node = obj.children()[0]

# Gather parameters
parms_int = []
parms_float = []

for child in target_node.children():
    for parm in child.parms():
        match parm.parmTemplate().type():
            case hou.parmTemplateType.Int:
                parms_int.append((parm, parm.evalAsInt()))
            case hou.parmTemplateType.Float:
                parms_float.append((parm, parm.evalAsFloat()))

# Generate variations
for i in range(count):
    parm_set = dict()

    for (parm, origVal) in parms_int:
        minVal = parm.parmTemplate().minValue()
        maxVal = parm.parmTemplate().maxValue()

        if (randomization_method == 1):
            newVal = random.randrange(minVal, maxVal)
        elif (randomization_method == 2):
            newVal = clamp(round(origVal * random.uniform(1.0-strength, 1.0+strength)), minVal, maxVal)
        elif (randomization_method == 3):
            delta = (maxVal - minVal) * random.uniform(-strength, strength)
            newVal = clamp(round(origVal + delta), minVal, maxVal)

        parm.set(newVal)
        parm_set[parm.path()] = newVal
        if (verbose):
            print(f"[{i}] Int: {parm.path()} Range: [{minVal}, {maxVal}] Value: {origVal}->{newVal}")

    for (parm, origVal) in parms_float:
        minVal = parm.parmTemplate().minValue()
        maxVal = parm.parmTemplate().maxValue()

        if (randomization_method == 1):
            newVal = random.uniform(minVal, maxVal)
        elif (randomization_method == 2):
            newVal = clamp(origVal * random.uniform(1.0-strength, 1.0+strength), minVal, maxVal)
        elif (randomization_method == 3):
            delta = (maxVal - minVal) * random.uniform(-strength, strength)
            newVal = clamp(origVal + delta, minVal, maxVal)

        parm.set(newVal)
        parm_set[parm.path()] = newVal
        if (verbose):
            print(f"[{i}] Float: {parm.path()} Range: [{minVal}, {maxVal}] Value: {origVal}->{newVal}")

    file_json = os.path.join(output_path,f'variation{i}_{os.path.basename(hdapath)}.json')
    with open(file_json, "w") as file:
        file.write(json.dumps(parm_set, indent=2))

    file_hip = os.path.join(output_path,f'variation{i}_{os.path.basename(hdapath)}.hip')
    hou.hipFile.save(file_name=file_hip)
    print(f"Variation {i} saved to: {file_hip}")

mdarol.end_houdini(hip)
