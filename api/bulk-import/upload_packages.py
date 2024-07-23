"""Bulk import package uploader, consumes a package list and uploads them to the package index API"""
import argparse
import importlib.util
import json
import os
import tempfile
from typing import Optional

import git
import requests
from github import GitRelease, Github
from munch import munchify
from packaging import version
from requests_toolbelt.multipart.encoder import MultipartEncoder

from models import PackageModel, ProcessedPackageModel

tempdir = tempfile.TemporaryDirectory()

DEFAULT_STARTING_VERSION = [1, 0, 0]
ZERO_VERSION = [0, 0, 0]


def get_github_user_project_name(ref_url: str) -> tuple[str, str]:
    """Given a GitHub style URL git@github.com:user/repo.git returns (user, repo)"""
    _, name_path = ref_url.split(':')
    name, path = name_path.split('/')
    assert path.endswith('.git')
    return name, path.replace('.git', '')


def get_repo_versions(repo):
    """Get the repo versions if they exist"""
    # Get all tags
    tags = sorted(repo.tags, key=lambda t: t.commit.committed_datetime, reverse=True)

    # Filter tags that look like version numbers and sort them
    version_tags = []
    for tag in tags:
        try:
            version.parse(str(tag))
            version_tags.append(tag)
        except version.InvalidVersion:
            print(f"Invalid version: {tag}")

    # Sort version tags
    sorted_versions = sorted(version_tags, key=lambda t: version.parse(str(t)), reverse=True)

    # Print the sorted releases
    for tag in sorted_versions:
        print(f"Release: {tag}, Date: {tag.commit.committed_datetime}")
    return sorted_versions[0:]


def get_github_latest_release(api_token, package) -> Optional[GitRelease]:
    """Lookup the releases for a project"""
    with Github(api_token) as g:
        owner, project = get_github_user_project_name(package.repo)
        repo = g.get_repo(f"{owner}/{project}")
        releases = repo.get_releases()
        if releases.totalCount == 0:
            return None
        latest_release = releases.reversed.get_page(0)[0]
        print("latest github release", latest_release)
        return latest_release


def get_default_branch(repo):
    """Get the default branch such as `main`"""
    # Get the remote origin
    remote_origin = repo.remotes.origin

    # Fetch remote references
    remote_refs = remote_origin.refs

    # The HEAD reference of the remote will point to the default branch
    remote_head = next((ref for ref in remote_refs if ref.name.endswith('HEAD')), None)

    if remote_head:
        # Extract the default branch from the remote HEAD reference
        default_branch = remote_head.reference.name.split('/')[-1]
        return default_branch
    else:
        raise ValueError("Cannot determine the default branch.")


def collect_doc_package_paths(package: ProcessedPackageModel, default_license: str) -> list[str]:
    """Get list of local package contents that represent core documentation"""
    # Verify the repo has a license file
    license_files = [file
                     for file in os.listdir(package.root_disk_path)
                     if file.lower().startswith('license')]

    if len(license_files) == 0 and default_license != None:
        license_files.append(default_license)

    if len(license_files) == 0:
        raise ValueError(f"Failed to find license file in repo: {package.repo}")

    # Find some documentation, sort readme by shortest name
    # to prioritize e.g. README.md over README-building.md
    readme_files = sorted([file
                           for file in os.listdir(package.root_disk_path)
                           if file.lower().startswith('readme')],
                          key=lambda n: len(n))
    return [license_files[0], *readme_files[0:]]


def collect_images_paths(package: ProcessedPackageModel) -> list[str]:
    """Collect all image package paths"""
    extensions = {'.png', '.jpg', '.jpeg', '.gif', '.webm'}
    contents = []
    for root, dirs, files in os.walk(package.root_disk_path):
        for file in files:
            name, ext = os.path.splitext(file)
            if ext in extensions:
                disk_path = os.path.join(root, file)
                package_path = os.path.relpath(disk_path, package.root_disk_path)
                contents.append(package_path)
    return contents


def any_upstream_changes(package: ProcessedPackageModel,
                         key: str,
                         new_asset_contents: list[dict]) -> bool:
    """Detect any changes in the GitHub upstream by doing a count and hash check"""
    # first index the latest version contents
    contents_by_hash = {asset_version_content.content_hash: asset_version_content
                        for asset_version_content in package.latest_version_contents.get(key, [])}
    # validate the file count matches
    if len(contents_by_hash.keys()) != len(new_asset_contents):
        print(("Changed due to file count mismatch:"
               f"{len(contents_by_hash.keys())} != {len(new_asset_contents)}"))
    # validate all content hashes exist in existing asset version content
    for new_content in new_asset_contents:
        new_content_hash = new_content['content_hash']
        if new_content_hash not in contents_by_hash:
            print(f"Content hash missing or changed {new_content_hash}")
            return True
    return False


def bump_package_version(package: ProcessedPackageModel):
    """Update the package version"""
    assert package.latest_version != ZERO_VERSION
    package.latest_version[2] += 1

def get_description_from_readme(package: ProcessedPackageModel):
    readme_path = os.path.join(package.root_disk_path, "readme.txt")
    if os.path.exists(readme_path):
        with open(readme_path, 'r') as f:
            package.description = f.read()


class PackageUploader(object):
    """Processes git repos into packages"""

    def __init__(self):
        self.package_list_file = None
        self.endpoint = ''
        self.token = ''
        self.repo_base_dir = ''
        self.github_api_token = None

    def parse_args(self):
        """Parse command line arguments"""
        parser = argparse.ArgumentParser(description="Upload Package")
        parser.add_argument(
            "-e", "--endpoint",
            help="API endpoint",
            default="http://localhost:50555",
            required=False
        )
        parser.add_argument(
            "-b", "--repo-base",
            help="Base directory for repo",
            default=None,
            required=False
        )
        parser.add_argument(
            "-G", "--github-api-token",
            help="GitHub API token",
            default=None,
            required=False
        )
        parser.add_argument(
            '-l', '--package-list',
            help='Python file with list of packages to upload',
            default='package_list.py',
            required=False
        )
        parser.add_argument(
            '-i', '--license',
            help='Default license file to use if package does not contain one',
            default=None,
            required=False
        )
        args = parser.parse_args()
        self.endpoint = args.endpoint
        self.repo_base_dir = args.repo_base or tempdir.name
        self.github_api_token = args.github_api_token
        self.package_list_file = args.package_list
        self.license = args.license

        # prepare the base repo directory
        if not os.path.exists(self.repo_base_dir):
            os.makedirs(self.repo_base_dir)

    def start_session(self, profile_id):
        """Create a session for the current profile"""
        url = f"{self.endpoint}/v1/profiles/start_session/{profile_id}"
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to start session: {response.status_code}")
            raise SystemExit

        o = munchify(response.json())
        return o.token

    def process_package(self, const_package: PackageModel):
        """Main entry point for each package definition being processed"""

        package = ProcessedPackageModel(**const_package.model_dump())

        if package.name == "":
            package.name = os.path.basename(package.repo)

        print(f"=====================================")
        print(f"Processing package: {package.name}")

        user = None
        user_description = None

        if package.repo.startswith("git"):
            self.update_local_repo(package)

            user, project = get_github_user_project_name(package.repo)
            user_description = f"imported from {package.commit_ref}"
            org_name = user
        else:
            # TODO: Read Perforce revision number
            package.root_disk_path = package.repo
            package.commit_ref = "unknown"
            package.repo = "MythicaPerforce::" + package.name

            user = "Mythica"
            user_description = "Upload automation profile"
            org_name = "Mythica"

        if package.description == "":
            package.description = get_description_from_readme(package)

        profile = self.find_or_create_profile(user, user_description)
        package.profile_id = profile.profile_id

        self.token = self.start_session(profile.profile_id)

        org = self.find_or_create_org(user)
        package.org_id = org.org_id

        # First try to resolve the version from the repo link
        package.asset_id, package.latest_version = self.find_versions_for_repo(package)
        if package.asset_id is None or package.asset_id == "":
            package.asset_id = self.create_asset(package)
            package.latest_version = ZERO_VERSION

        asset_contents = self.gather_contents(package)
        if len(asset_contents['files']) == 0:
            print(f"Failed to find any files in directory {package.directory} for package {package.name}")
            return

        if self.latest_version_exists(package):
            if package.latest_github_version and package.latest_github_version != package.latest_version:
                package.latest_version = package.latest_github_version
                print(f"Updating {package.name} to latest github release: {package.latest_github_version}")
            elif any_upstream_changes(package, 'files', asset_contents['files']):
                bump_package_version(package)
                print(f"File change detected, bumped {package.name} version to {package.latest_version}")
            elif any_upstream_changes(package, 'thumbnails', asset_contents['thumbnails']):
                bump_package_version(package)
                print(f"Thumbnail change detected, bumped {package.name} version to {package.latest_version}")
            else:
                print(f"Skipping {package.name}, latest version available")
                return
        else:
            package.latest_version = DEFAULT_STARTING_VERSION
            print(f"Creating {package.name} {DEFAULT_STARTING_VERSION}")

        self.create_version(package, asset_contents)

    def find_or_create_org(self, org_name: str):
        """Find or create an organization object"""
        response = requests.get(f"{self.endpoint}/v1/orgs/named/{org_name}?exact=true")
        response.raise_for_status()
        orgs = response.json()
        if len(orgs) == 1:
            return munchify(orgs[0])
        org_json = {"name": org_name}
        response = requests.post(f"{self.endpoint}/v1/orgs",
                                 headers=self.auth_header(),
                                 json=org_json)
        response.raise_for_status()
        return munchify(response.json())

    def find_or_create_profile(self, user: str, description: str):
        """Find or create a profile object implementation"""
        response = requests.get(f"{self.endpoint}/v1/profiles/named/{user}?exact=true")
        response.raise_for_status()
        profiles = response.json()
        if len(profiles) == 1:
            return munchify(profiles[0])

        profile_json = {
            "name": user,
            "email": "donotreply+importer@mythica.ai",
            "description": description,
        }
        response = requests.post(f"{self.endpoint}/v1/profiles", json=profile_json)
        response.raise_for_status()
        return munchify(response.json())

    def find_versions_for_repo(self, package: PackageModel) -> tuple[str, list[int]]:
        """Find or create version objects for the repo URL"""
        response = requests.get(f"{self.endpoint}/v1/assets/committed_at?ref={package.repo}")
        response.raise_for_status()

        versions = munchify(response.json())
        sorted_versions = sorted(versions, key=lambda k: k['version'], reverse=True)
        if len(sorted_versions) == 0:
            return '', ZERO_VERSION
        print(f"Found {len(sorted_versions)} versions for {package.name}")
        print(f"Using latest version: {sorted_versions[0]['version']}")
        latest_version = sorted_versions[0]
        return latest_version.asset_id, latest_version.version

    def auth_header(self) -> dict[str, str]:
        """Return the authorization token header"""
        return {
            "Authorization": f"Bearer {self.token}"
        }

    def create_asset(self, package: PackageModel):
        """Create the asset root object"""
        asset_json = {
            "org_id": package.org_id
        }

        response = requests.post(f"{self.endpoint}/v1/assets", headers=self.auth_header(), json=asset_json)
        if response.status_code != 201:
            print(f"Failed to create asset for {package.name}")
            print(f"Request Error: {response.status_code} {response.content}")
            return ""

        o = munchify(response.json())
        asset_id = o.asset_id
        print(f"Created assetId {asset_id} for asset {package.name}")
        return asset_id

    def latest_version_exists(self, package: PackageModel) -> bool:
        """Check if the asset version already exists"""
        assert len(package.latest_version) == 3
        if package.latest_version == ZERO_VERSION:
            return False

        version_str = '.'.join(map(str, package.latest_version))
        response = requests.get(f"{self.endpoint}/v1/assets/{package.asset_id}/versions/{version_str}")
        if response.status_code != 200:
            print(f"Version {version_str} not found for {package.name} ({package.asset_id})")
            return False

        o = munchify(response.json())
        package.latest_version_contents = o.contents
        if o.version == package.latest_version:
            print(f"Skipping package {package.name} already uploaded.")
            return True
        return False

    def update_local_repo(self, package: PackageModel):
        """Clone or refresh the local repo"""
        package.root_disk_path = os.path.abspath(os.path.join(str(self.repo_base_dir), package.name))
        if os.path.exists(package.root_disk_path):
            print(f"Pulling repo {package.repo} in {package.root_disk_path}")
            repo = git.Repo(package.root_disk_path)
            repo.git.checkout(get_default_branch(repo))
            repo.git.pull()
        else:
            print(f"Cloning repo: {package.repo} into {package.root_disk_path}")
            repo = git.Repo.clone_from(package.repo, package.root_disk_path)

        package.commit_ref = repo.head.commit.hexsha

        # get the latest release if it exists
        latest_release = get_github_latest_release(self.github_api_token, package)
        if latest_release:
            repo.git.checkout(latest_release.tag_name)
            try:
                v = version.parse(latest_release.tag_name)
                package.latest_github_version = [v.major, v.minor, v.micro]
            except version.InvalidVersion:
                pass
            package.description += " (Release: " + latest_release.title + ")"
        else:
            package.latest_version = ZERO_VERSION

    def gather_contents(self, package: ProcessedPackageModel) -> dict[str, list]:
        """Gather all files to be included in the package"""
        files_paths = []
        thumbnail_paths = []

        files_paths.extend(collect_doc_package_paths(package, self.license))
        thumbnail_paths.extend(collect_images_paths(package))
        scan_path = os.path.join(package.root_disk_path, package.directory)
        for root, dirs, files in os.walk(scan_path):
            for file in files:
                disk_path = os.path.join(root, file)
                package_path = os.path.relpath(disk_path, package.root_disk_path)
                files_paths.append(package_path)

        file_contents = []

        # Upload all files
        for package_path in files_paths:
            file_contents.append(
                self.upload_package_path(package, package_path))
        thumbnail_contents = []
        for package_path in thumbnail_paths:
            thumbnail_contents.append(
                self.upload_package_path(package, package_path))

        return {
            'files': file_contents,
            'thumbnails': thumbnail_contents
        }

    def upload_package_path(self,
                            package: ProcessedPackageModel,
                            file_package_path: str) -> dict:
        """Upload a file from a package path, return it's asset contents"""
        filepath = os.path.normpath(os.path.join(package.root_disk_path, file_package_path))
        print(f"Uploading file: {filepath}")

        with open(filepath, 'rb') as f:
            upload_url = f"{self.endpoint}/v1/upload/store"
            m = MultipartEncoder(
                fields={'files': (file_package_path, f, 'application/octet-stream')}
            )
            headers = {
                **self.auth_header(),
                "Content-Type": m.content_type,
            }
            response = requests.post(upload_url, headers=headers, data=m)
            response.raise_for_status()

            o = munchify(response.json())
            return {
                'file_id': o.files[0].file_id,
                'file_name': o.files[0].file_name,
                'content_hash': o.files[0].content_hash,
                'size': o.files[0].size
            }

    def create_version(self, package: PackageModel, asset_contents: dict[str, list]) -> dict:
        """Create new asset version"""
        asset_ver_json = {
            'asset_id': package.asset_id,
            'commit_ref': f"{package.repo}/{package.commit_ref}",
            'contents': asset_contents,
            'name': package.name,
            'description': package.description,
            'author': package.profile_id,
            'published': True
        }
        # if package.org_id is not None:
        #   asset_ver_json['org_id'] = package.org_id
        version_str = '.'.join(map(str, package.latest_version))
        assets_url = f"{self.endpoint}/v1/assets/{package.asset_id}/versions/{version_str}"
        response = requests.post(assets_url, headers=self.auth_header(), json=asset_ver_json)
        response.raise_for_status()

        print(f"Successfully uploaded package: {package.name}")


def main():
    """Entrypoint"""
    uploader = PackageUploader()
    uploader.parse_args()

    # load the package list
    spec = importlib.util.spec_from_file_location('package_list', uploader.package_list_file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    packages = getattr(module, 'packages', None)
    for package in packages:
        try:
            uploader.process_package(PackageModel(**package))
        except requests.exceptions.HTTPError as e:
            print(e)
            print(json.dumps(e.response.json()))
            raise


if __name__ == "__main__":
    main()
