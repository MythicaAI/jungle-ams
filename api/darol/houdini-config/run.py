import os
import subprocess
import argparse
import json 

description="""
Houdini automation entry point for Darol. This script will execute one of the `actions`
in the `hython` subdirectory. Actions are houdini hython scripts inteded to 
run inside the context of Houdini and have access to the Darol plugin. 

The execution environment for `actions` is a hython interpreter hosted inside a docker
container. Any resulting networks or other output files are saved to `--output-path` 
specified (this path must be accessible inside the Docker container)

`action` will be one of the automation files in `./hython`. Note the naming pattern for actions
is structured as python modules anchored at the root ./hython (eg: `hython/foo/action.py`
is the action `foo.action`) 

FOR DEVELOPMENT: If `--docker` is specified a docker container will be provided. Otherwise
one is assumed. A `--docker-version` may be specified for the provided container. If `--docker`
is specified and this is the first time the image is being built then `--sfx-client-id` and 
`--sfx-client-secret` must be specified or the image will fail to authenticate. Alternatively
clients can edit the file: `/root/houdini20.0/hserver.ini` and store credentials there 
"""

# Make sure actions are presented as module names, not file paths
_actions_root=os.path.join(os.path.dirname(__file__),'automation')
actions = []

for dirpath, dirnames, filenames in os.walk(_actions_root):
    for filename in filenames:
        if filename.endswith('.py'):
            parent_dir = os.path.basename(dirpath).replace(
                os.path.basename(_actions_root),'').replace(
                    '/','.')                
            action = f"{parent_dir}{'.' if parent_dir != '' else ''}{os.path.splitext(filename)[0]}"
            actions.append(action)

# Action to Path converter for convenience
def get_action_path(action):
    return f"/darol/automation/{action.replace('.','/')}.py"


# Arguments Parser
parser = argparse.ArgumentParser(description=description)
parser.add_argument(
    "action", 
    choices=actions,  
    help=f"Houdini Automation Action to execute. Must be one of: [{'|'.join(actions)}] "
)
parser.add_argument(
    "--output-path",
    default=('/output'),
    type=str,
    help="Output directory in the container to save the HIP and other output files to.  Default: '/output'",
)
parser.add_argument(
    "--license-server",
    default="https://www.sidefx.com/license/sesinetd",
    type=str,
    help="Output directory to save the HIP file and Unreal project directory. Default: 'https://www.sidefx.com/license/sesinetd'",
)
parser.add_argument(
    "--docker",
    action="store_true",
    help="If specified, a Docker Container is provided, otherwise it is assumed. Default: false",
)
parser.add_argument(
    "--docker-version",
    default='latest',
    type=str,
    help=("If --docker, the version of houdini to use to execute for the hython interpreter."
          "Note: this affects the built in python version used Default: './latest'")
)
parser.add_argument(
    "--sfx-client-id",
    default="",
    type=str,
    help=("If --docker, the side FX API key to be used for authorized calls from the image. Only used on first image build")
)
parser.add_argument(
    "--sfx-client-secret",
    default="",
    type=str,
    help=("If --docker, the side FX API Client Secret to be used for authorized calls from the image. Only used on first image build")
)

# Assume any additional args are for the action
args, hython_args = parser.parse_known_args()

# Process args
hython_script = get_action_path(args.action)
output_path = args.output_path

print(f"Running Darol Houdini Automation: {args.action}")

cmd = []

### For development 
if args.docker:
    print(f"Docker Environment being provided. Using Houdini version: {args.docker_version}")
    docker_image = f"kevincalderone/hbuild:{args.docker_version}"

    result = subprocess.run(["docker", "pull", docker_image], capture_output=True, text=True)
    if result.returncode != 0:
        raise("Error pulling Docker image:", result.stderr)

    local_output_path = os.path.abspath("./output")

    docker_image="hautomation"
    cmd = ["docker", "build"]
    cmd = cmd + ["--build-arg", f"SFX_CLIENT_ID={args.sfx_client_id}","--build-arg", f"SFX_CLIENT_SECRET={args.sfx_client_secret}"]
    cmd = cmd + ["-t", "hautomation", "."]
    subprocess.run(cmd)
    cmd = ["docker", "run", "-it", "--rm", "-v", f"{local_output_path}:{output_path}", docker_image]

cmd = cmd + ['/bin/bash','-c']
bash_cmd = (
    f"hserver -S {args.license_server} && "                                                     # Connect to Licensing Server
    f"hython {hython_script} --output-path {output_path} {' '.join(map(str,hython_args))} && "  # Execute Hython script
    f"hserver -Q"                                                                               # Close Connection
)

cmd.append(bash_cmd)

result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode == 0:
    print("Commands executed successfully.")
    print("Output:\n", result.stdout)
else:
    print("Error executing commands:")
    if not args.docker:
        print("Make sure the execution context is a Houdini Docker container")
    print("Standard Error Output:\n", result.stdout, result.stderr)


