import argparse
import git
import os
import requests
import shutil
import stat

from munch import munchify

packages = [
    {
        'asset_id': "b9febdba-f3e7-4668-8e96-802039d33495",
        'version': "1.0.0",
        'repo': "git@github.com:jamesrobinsonvfx/inspectnodedata.git",
        'directory': "houdini18.5/hda",    
        'name': "Inspect Node Data",
        'description': "SOP-level HDA for storing, retrieving, and inspecting parameters from nodes."
    }
]

parser = argparse.ArgumentParser(description="Upload Package")
parser.add_argument(
    "-e", "--endpoint",
    help="API endpoint",
    default="http://localhost:50555",
    required=False
)
parser.add_argument(
    "-p", "--profileId",
    help="API profileId",
    default="0c016413-e1e7-480e-8310-4ebce2fe584e",
    required=False
)
args = parser.parse_args()

# Create a session
url = f"{args.endpoint}/v1/profiles/start_session/{args.profileId}"
response = requests.get(url)
if response.status_code != 200:
    print(f"Failed to start session: {response.status_code}")
    raise SystemExit

o = munchify(response.json())
headers = {
    "Authorization": f"Bearer {o.token}"
}

# Create a temp directory
def remove_readonly(func, path, excinfo):
    if (os.path.exists(path)):
        os.chmod(path, stat.S_IWRITE)
        func(path)
    
tempdir = os.path.join(os.getcwd(), "temp")
shutil.rmtree(tempdir, onerror=remove_readonly)
os.makedirs(tempdir, exist_ok=True)

# Upload packages
for package in packages:
    print(f"Processing package: {package['name']}")

    # Check if the asset version already exists
    url = f"{args.endpoint}/v1/assets/{package['asset_id']}/versions/{package['version']}"
    response = requests.get(url)
    if response.status_code == 200:
        print(f"Skipping package {package['name']} already uploaded.")
        continue
    elif response.status_code != 404:
        print(f"Failed to check asset version for {package['name']}")
        print(f"Request Error: {response.status_code} {response.content}")
        continue

    # Clone the repo
    print(f"Cloning repo: {package['repo']}")
    repodir = os.path.join(tempdir, package['name'])
    repo = git.Repo.clone_from(package['repo'], repodir)

    # Create new asset version
    asset_ver_json = {
        'asset_id': package['asset_id'],
        'commit_ref': f"{package['repo']}/{repo.heads.main.commit.hexsha}",
        'contents': {"files": []},
        'name': package['name'],
        'description': package['description'],
        'author': args.profileId
    }
    response = requests.post(url, headers=headers, json=asset_ver_json)
    if response.status_code != 200:
        print(f"Failed to create asset version for package: {package['name']}")
        print(f"Request Error: {response.status_code} {response.content}")
        continue

    # Upload all files in the target directory
    for root, dirs, files in os.walk(os.path.join(repodir, package['directory'])):
        for file in files:
            filepath = os.path.normpath(os.path.join(root, file))
            print(f"Uploading file: {filepath}")

            with open(filepath, 'rb') as f:
                url = f"{args.endpoint}/v1/upload/package/{package['asset_id']}/{package['version']}"
                files = {
                    "files": f
                }
                response = requests.post(url, headers=headers, files=files)
                if response.status_code != 200:
                    print(f"Failed to upload file: {filepath}")
                    print(f"Request Error: {response.status_code} {response.content}")
                    continue