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
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:kdbra/kdbra-houdini-tools.git",
        'directory': "otls",
        'name': "KDBRA Tools",
        'description': "Kdbra tools are intended to speed up and facilitate VFX artist's routines."
    }
]

'''
packages = [
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:kdbra/kdbra-houdini-tools.git",
        'directory': "otls",
        'name': "KDBRA Tools",
        'description': "Kdbra tools are intended to speed up and facilitate VFX artist's routines."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:TrevisanGMW/gt-houdini-assets.git",
        'directory': "assets",
        'name': "GT Houdini Assets",
        'description': "These assets were created with the aim of automating, simplifying or to be used as a learning tool."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:CorvaeOboro/zenv.git",
        'directory': "hda",
        'name': "ZENV",
        'description': "Houdini hda tools focused on procedural modeling environments."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:mifth/mifthtools.git",
        'directory': "houdini/otls",
        'name': "MiraTools",
        'description': "Modern modeling and retopology tools."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:NiklasRosenstein/houdini-library.git",
        'directory': "otls",
        'name': "Niklas' Houdini Library",
        'description': "A collection of digital assets, shelf tools and code snippets."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:LaidlawFX/LaidlawFX.git",
        'directory': "otls",
        'name': "LaidlawFX",
        'description': "A repository of tools developed in production."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:eglaubauf/egLib.git",
        'directory': "otls",
        'name': "egLib",
        'description': "A collection of scripts for SideFx Houdini."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:igor-elovikov/hipie.git",
        'directory': "otls",
        'name': "Houdini Tools by Igor Elovikov",
        'description': ""
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:thi-ng/houdini.git",
        'directory': "hda",
        'name': "thi.ng Houdini Tools",
        'description': "Houdini HDAs & sketches (VEX, OpenCL, Python)"
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:ivantitov-zd/Hammer.git",
        'directory': "otls",
        'name': "Hammer Tools",
        'description': "Hammer Tools"
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:sashaouellet/SDMTools.git",
        'directory': "houdini/otls",
        'name': "SDMTools",
        'description': "A collection of shelf tools, HDAs, and menu scripts in its Houdini form."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:captainhammy/Houdini-Toolbox.git",
        'directory': "houdini/otls",
        'name': "Houdini Toolbox",
        'description': "Collection of Houdini tools."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:qLab/qLib.git",
        'directory': "otls",
        'name': "qLib",
        'description': "A procedural asset library for SideFX Houdini."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:joshuazt/JZTREES.git",
        'directory': "otls",
        'name': "JZTREES",
        'description': "Set of tools designed to ease the workflow for generating and applying FX to trees and vegetation."
    },
    {
        'asset_id': "",
        'version': "1.0.0",
        'repo': "git@github.com:demiaster/treegen.git",
        'directory': "assets",
        'name': "Treegen",
        'description': "Vegetation Generation Tool for Houdini."
    }
]
'''


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
    default="3efde9d6-a032-4ddf-9121-a959382363f3",
    required=False
)
parser.add_argument(
    "-o", "--orgId",
    help="API orgId",
    default=None,
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

    assetId = package['asset_id']

    # Find or create asset
    def find_asset_id(asset_name):
        response = requests.get(f"{args.endpoint}/v1/assets/all")
        if response.status_code != 200:
            print(f"Failed to get asset list")
            print(f"Request Error: {response.status_code} {response.content}")
            return ""
        
        o = munchify(response.json())
        for asset in o:
            if asset.name == asset_name:
                return asset.asset_id
            
        return ""

    def create_asset(asset_name):
        asset_json = {
            "org_id": args.orgId
        }
        headers = {
            "Authorization": f"Bearer {token}"
        }
        response = requests.post(f"{args.endpoint}/v1/assets", headers=headers, json=asset_json)
        if response.status_code != 201:
            print(f"Failed to create asset for {asset_name}")
            print(f"Request Error: {response.status_code} {response.content}")
            return ""

        o = munchify(response.json())
        print(f"Created assetId {o.id} for asset {asset_name}")
        return o.id

    if assetId == "":
        assetId = find_asset_id(package['name'])
    if assetId == "":
        assetId = create_asset(package['name'])
    if assetId == "":
        print(f"Failed to create asset for {package['name']}")
        continue

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
        'commit_ref': f"{package['repo']}/{repo.head.commit.hexsha}",
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
