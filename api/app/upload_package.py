import argparse
import git
import os
import requests
import shutil
import stat

from munch import munchify
from requests_toolbelt.multipart.encoder import MultipartEncoder

packages = [
    {
        'asset_id': "b9febdba-f3e7-4668-8e96-802039d33495",
        'version': "8.0.0",
        'repo': "git@github.com:jamesrobinsonvfx/inspectnodedata.git",
        'directory': "houdini18.5/hda",
        'name': "Inspect Node Data",
        'description': "SOP-level HDA for storing, retrieving, and inspecting parameters from nodes."
    },
    {
        'asset_id': "5a33dff9-7d97-4ed8-ade7-ca938b09fc8e",
        'version': "2.0.0",
        'repo': "git@github.com:probiner/DASH.git",
        'directory': "otls",
        'name': "Dash",
        'description': "Granular utilities for SideFX Houdini."
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
parser.add_argument(
    "-o", "--orgId",
    help="API orgId",
    default="52b8a359-a510-4c09-a057-899d299b2c23",
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
token = o.token

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
    print(f"=====================================")
    print(f"Processing package: {package['name']}")

    # Check if the asset version already exists
    asset_url = f"{args.endpoint}/v1/assets/{package['asset_id']}/versions/{package['version']}"
    response = requests.get(asset_url)
    if response.status_code != 200:
        print(f"Failed to get asset version for {package['name']}")
        print(f"Request Error: {response.status_code} {response.content}")
        continue

    o = munchify(response.json())
    version_str = f"{o.version[0]}.{o.version[1]}.{o.version[2]}"
    if version_str == package['version']:
        print(f"Skipping package {package['name']} already uploaded.")
        continue

    # Clone the repo
    print(f"Cloning repo: {package['repo']}")
    repodir = os.path.join(tempdir, package['name'])
    repo = git.Repo.clone_from(package['repo'], repodir)

    # Upload all files in the target directory
    asset_contents = []
    for root, dirs, files in os.walk(os.path.join(repodir, package['directory'])):
        for file in files:
            filepath = os.path.normpath(os.path.join(root, file))
            print(f"Uploading file: {filepath}")

            with open(filepath, 'rb') as f:
                upload_url = f"{args.endpoint}/v1/upload/store"
                m = MultipartEncoder(
                    fields={'files': (file, f, 'application/octet-stream')}
                )
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": m.content_type
                }
                response = requests.post(upload_url, headers=headers, data=m)
                if response.status_code != 200:
                    print(f"Failed to upload file: {filepath}")
                    print(f"Request Error: {response.status_code} {response.content}")
                    continue

                o = munchify(response.json())
                asset_contents.append({
                    'file_id': o.files[0].file_id,
                    'file_name': o.files[0].file_name,
                    'content_hash': o.files[0].content_hash,
                    'size': o.files[0].size
                })
    
    # Create new asset version
    asset_ver_json = {
        'asset_id': package['asset_id'],
        'commit_ref': f"{package['repo']}/{repo.heads.main.commit.hexsha}",
        'contents': {"files": asset_contents},
        'name': package['name'],
        'description': package['description'],
        'author': args.profileId,
        'org_id': args.orgId
    }
    headers = {
        "Authorization": f"Bearer {token}"
    }   
    response = requests.post(asset_url, headers=headers, json=asset_ver_json)
    if response.status_code != 201:
        print(f"Failed to create asset version for package: {package['name']}")
        print(f"Request Error: {response.status_code} {response.content}")
        continue

    print(f"Succesfully uploaded package: {package['name']}")
