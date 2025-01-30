"""Bulk import package uploader, consumes a package list and uploads them to the package index API"""
import argparse
import hashlib
import importlib.util
import json
import logging
import os
import re
import tempfile
from http import HTTPStatus
from pathlib import Path, PurePosixPath
from typing import Any, Optional

import git
import requests
from github import GitRelease, Github
from munch import munchify
from packaging import version
from pathspec import PathSpec
from pydantic import BaseModel
from requests_toolbelt.multipart.encoder import MultipartEncoder

from connection_pool import ConnectionPool
from log_config import log_config
from models import FileRef, OrgResponse, PackageFile, PackageModel, ProcessedPackageModel
from perforce import parse_perforce_change, run_p4_command

tempdir = tempfile.TemporaryDirectory()

DEFAULT_STARTING_VERSION = [1, 0, 0]
ZERO_VERSION = [0, 0, 0]

log_config(log_level="DEBUG")

log = logging.getLogger(__name__)


class Stats(BaseModel):
    uploaded: int = 0
    skipped: int = 0


def as_posix_path(path: str) -> PurePosixPath:
    """Convert string paths to explicitly posix paths for package relative paths"""
    return PurePosixPath(Path(path).as_posix())


def get_github_user_project_name(ref_url: str) -> tuple[str | Any, ...]:
    """
    Given a GitHub style URL git@github.com:user/repo.git or https://github.com/user/repo

    returns (user, repo)
    """
    match = re.match(r'(?:git@github\.com:|https://github\.com/)([^/]+)/([^/.]+)', ref_url)
    if not match:
        raise ValueError(f"Invalid GitHub URL: {ref_url}")
    return match.groups()


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
            log.error("Invalid version: %s", tag)

    # Sort version tags
    sorted_versions = sorted(version_tags, key=lambda t: version.parse(str(t)), reverse=True)

    # Print the sorted releases
    for tag in sorted_versions:
        log.info("Release: %s, Date: %s", tag, tag.commit.committed_datetime)
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
        log.info("latest github release %s", latest_release)
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


def get_p4_change_list(path: Path) -> int:
    """
    Get the latest Perforce changelist number for a path.

    Args:
        path (str): Path to check. Defaults to current directory.

    Returns:
        int: Changelist number, or -1 if there's an error
    """

    cmd = ["p4", "changes", "-m", "1", f"{path}..."]
    result = run_p4_command(cmd, p4_env=os.environ.copy())
    if result.success:
        log.info("p4 command success %s", result.stdout)
        info = parse_perforce_change(result.stdout)
        log.info("perforce cl#: %s, by: %s, '%s'",
                 info["change_number"],
                 info["username"],
                 info["description"])
        return int(info["change_number"])
    else:
        log.error(result.long_error_description())
        raise ValueError(result.short_error_description())


def collect_doc_package_paths(package: ProcessedPackageModel, default_license: str) \
        -> list[PackageFile]:
    """Get list of local package contents that represent core documentation"""
    # Verify the repo has a license file
    license_files = [PackageFile(
        disk_path=Path(package.root_disk_path / file),
        package_path=as_posix_path(file))
        for file in os.listdir(package.root_disk_path)
        if file.lower().startswith('license')]

    if len(license_files) == 0 and default_license:
        # add a package relative license with the default name or use
        # it as a path in the current working directory
        assert os.path.exists(default_license)
        abs_path = os.path.abspath(default_license)
        package_path = os.path.split(default_license)[-1]
        license_files.append(PackageFile(
            disk_path=Path(abs_path),
            package_path=as_posix_path(package_path)))

    if len(license_files) == 0:
        raise ValueError(f"Failed to find license file in repo: {package.repo}")

    # Find some documentation, sort readme by shortest name
    # to prioritize e.g. README.md over README-building.md
    readme_files = sorted([PackageFile(
        disk_path=Path(package.root_disk_path / file),
        package_path=as_posix_path(file))
        for file in os.listdir(package.root_disk_path)
        if file.lower().startswith('readme')],
        key=lambda package_file: len(str(package_file.package_path)))
    return [license_files[0], *readme_files[0:]]


image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.webm'}


def collect_image_inputs_by_attribute(
        package: ProcessedPackageModel,
        attr_name: str,
        inputs: list[str]) -> list[PackageFile]:
    """
    Collect image inputs from an explicit attribute of the package
    """
    log.info("pulling in image inputs from %s: %s", attr_name, inputs)
    contents = []
    for input_pattern in inputs:
        if '*' in input_pattern:
            raise ValueError("globbing not yet supported")

        disk_path = os.path.join(package.root_disk_path, input_pattern)
        name, ext = os.path.splitext(disk_path)
        if ext not in image_extensions:
            raise ValueError(f"{disk_path} not supported with {image_extensions}")
        if not os.path.exists(disk_path):
            raise ValueError(f"{disk_path} does not exist")

        package_path = as_posix_path(os.path.relpath(disk_path, package.root_disk_path))
        contents.append(
            PackageFile(
                disk_path=Path(disk_path),
                package_path=package_path))
    return contents


def collect_images_paths(package: ProcessedPackageModel) -> list[PackageFile]:
    """Collect all image package paths"""
    # Shortcut the image paths if thumbnails are specified
    if package.thumbnails:
        return collect_image_inputs_by_attribute(package, 'thumbnails', package.thumbnails)

    contents: list[PackageFile] = list()
    for root, dirs, files in os.walk(package.root_disk_path):
        for file in files:
            name, ext = os.path.splitext(file)
            if ext in image_extensions:
                disk_path = Path(os.path.join(root, file))
                package_path = as_posix_path(os.path.relpath(disk_path, package.root_disk_path))
                contents.append(
                    PackageFile(
                        disk_path=disk_path,
                        package_path=package_path))
    return contents


def any_upstream_changes(package: ProcessedPackageModel,
                         category: str) -> bool:
    """Detect any changes in the GitHub upstream by doing a count and hash check"""
    # first index the latest version contents
    asset_contents = package.asset_contents[category]
    latest_version_contents = package.latest_version_contents.get(category, [])

    # use the content hash as the key to validate
    contents_by_hash = {asset_version_content.content_hash: asset_version_content
                        for asset_version_content in latest_version_contents}
    # validate the file count matches
    if len(latest_version_contents) != len(asset_contents):
        log.info("Changed due to file count mismatch: %s != %s",
                 len(latest_version_contents), len(asset_contents))
        return True

    # validate all content hashes exist in existing asset version content
    for new_content in asset_contents:
        new_content_hash = new_content.content_hash
        if new_content_hash not in contents_by_hash:
            log.info("Content hash missing or changed %s, %s",
                     new_content.file_name, new_content_hash)
            return True
    return False


def bump_package_version(package: ProcessedPackageModel):
    """Update the package version"""
    assert package.latest_version != ZERO_VERSION
    package.latest_version[2] += 1


def get_description_from_readme(package: ProcessedPackageModel):
    readme_path = os.path.join(package.root_disk_path, "readme.txt")
    description = ""
    if os.path.exists(readme_path):
        with open(readme_path, 'r') as f:
            description = f.read()
    return description


class PackageUploader(object):
    """Processes git repos into packages"""

    def __init__(self, conn_pool: ConnectionPool, ignore_spec: PathSpec):
        self.license = None
        self.package_list_file = None
        self.endpoint = ''
        self.mythica_api_key = None
        self.auth_token = None
        self.repo_base_dir = ''
        self.github_api_token = None
        self.tag = None
        self.tag_id = None
        self.conn_pool = conn_pool
        self.markdown = None
        self.stats = Stats()
        self.ignore_spec = ignore_spec

    def parse_args(self):
        """Parse command line arguments"""
        parser = argparse.ArgumentParser(description="Upload Package")
        parser.add_argument(
            "-e", "--endpoint",
            help="API endpoint",
            default="http://localhost:15555",
            required=False
        )
        parser.add_argument(
            "-b", "--repo-base",
            help="Base directory for repo",
            default=None,
            required=False
        )
        parser.add_argument(
            "-M", "--mythica-api-key",
            help="Mythica API key",
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
        parser.add_argument(
            '-t', '--tag',
            help='Default tag to use when importing the package',
            default=None,
            required=False
        )
        parser.add_argument(
            '--markdown',
            help='File to write GitHub flavored markdown',
            default=None,
            required=False
        )
        args = parser.parse_args()
        self.endpoint = args.endpoint
        self.repo_base_dir = args.repo_base or tempdir.name
        self.github_api_token = args.github_api_token
        self.mythica_api_key = args.mythica_api_key
        self.package_list_file = args.package_list
        self.license = args.license
        self.tag = args.tag
        self.tag_id = None
        self.markdown = open(args.markdown, "w+t") if args.markdown else None
        if self.markdown:
            self.start_md()

        # prepare the base repo directory
        if not os.path.exists(self.repo_base_dir):
            os.makedirs(self.repo_base_dir)

    def start_session(self, as_profile_id=None):
        """Create a session for the current profile"""
        assert self.mythica_api_key is not None

        if as_profile_id:
            headers = {"Impersonate-Profile-Id": as_profile_id}
        else:
            headers = {}

        url = f"{self.endpoint}/v1/sessions/key/{self.mythica_api_key}"
        response = self.conn_pool.get(url, headers=headers)
        if response.status_code != 200:
            log.error("Failed to start session: %s, check your Mythica API Key",
                      response.status_code)
            raise SystemExit

        o = munchify(response.json())
        self.auth_token = o.token
        log.info("started session for profile: \"%s\" <%s> (%s), validated: %s",
                 o.profile.name,
                 o.profile.email,
                 o.profile.profile_id,
                 o.profile.validate_state)

    def process_package(self, const_package: PackageModel):
        """Main entry point for each package definition being processed"""

        package = ProcessedPackageModel(**const_package.model_dump())

        if package.name == "":
            package.name = os.path.basename(package.repo)

        log.info("Processing package: %s", package.name)

        if package.repo.startswith("git") or package.repo.startswith("https://github"):
            self.update_local_github_repo(package)

            user, project = get_github_user_project_name(package.repo)
            user_description = f"imported from {package.commit_ref}"
        else:
            # build the root disk path
            if os.path.isabs(package.repo):
                package.root_disk_path = Path(package.repo)
            else:
                package.root_disk_path = Path(os.path.abspath(
                    os.path.join(os.path.dirname(self.package_list_file), package.repo)))

            package.commit_ref = f"#{get_p4_change_list(package.root_disk_path)}"
            package.repo = "MythicaPerforce::" + package.name

            user = "Mythica"
            user_description = "Upload automation profile"

        if package.user is not None:
            user = package.user

        if package.description == "":
            package.description = get_description_from_readme(package)

        profile = self.find_or_create_profile(user, user_description)
        package.profile_id = profile.profile_id
        package.profile_name = profile.name

        # start a new session as the package profile_id to impersonate actions on behalf
        # of the provided profile
        self.start_session(package.profile_id)

        # First try to resolve the version from the repo link
        package.asset_id, package.latest_version = self.find_latest_repo_version(package)
        if not package.asset_id:
            package.asset_id = self.create_asset(package)
            package.latest_version = ZERO_VERSION

        package.asset_contents = self.gather_contents(package)
        if len(package.asset_contents['files']) == 0:
            log.error("Failed to find any files in directory %s for package %s",
                      package.directory, package.name)
            return
        log.info("gathered %s files, %s images to create the asset version",
                 len(package.asset_contents['files']), len(package.asset_contents['thumbnails']))

        last_known_version = package.latest_version
        if self.latest_version_exists(package):
            if package.latest_github_version and package.latest_github_version != package.latest_version:
                package.latest_version = package.latest_github_version
                log.info("Updating %s to latest github release: %s",
                         package.name, package.latest_github_version)
            elif any_upstream_changes(package, 'files'):
                bump_package_version(package)
                log.info("File change detected, bumped %s version to %s",
                         package.name, package.latest_version)
            elif any_upstream_changes(package, 'thumbnails'):
                bump_package_version(package)
                log.info("Thumbnail change detected, bumped %s version to %s",
                         package.name, package.latest_version)
            else:
                log.info("Skipping %s, latest version available: %s",
                         package.name, package.latest_version)
                self.emit_md(package, "skipped, no changes detected")
                self.stats.skipped += 1
        else:
            package.latest_version = DEFAULT_STARTING_VERSION
            log.info("Creating package: %s, version: %s",
                     package.name, DEFAULT_STARTING_VERSION)

        # create the version if it has been updated
        if last_known_version != package.latest_version:
            self.create_version(package, package.asset_contents)

        # always add the specified tag
        if self.tag:
            if not self.tag_id:
                self.tag_id = self.find_or_create_tag(self.tag)
            self.tag_asset(package, self.tag_id)

    def find_or_create_org(self, org_name: str) -> OrgResponse:
        """Find or create an organization object"""
        response = self.conn_pool.get(f"{self.endpoint}/v1/orgs/named/{org_name}?exact=true")
        response.raise_for_status()
        orgs = response.json()
        if len(orgs) == 1:
            return OrgResponse(**orgs[0])
        org_json = {"name": org_name}
        response = self.conn_pool.post(f"{self.endpoint}/v1/orgs",
                                       headers=self.auth_header(),
                                       json=org_json)
        response.raise_for_status()
        return OrgResponse(**response.json())

    def find_or_create_profile(self, user: str, description: str):
        """Find or create a profile object implementation"""
        response = self.conn_pool.get(f"{self.endpoint}/v1/profiles/named/{user}?exact=true")
        response.raise_for_status()
        profiles = response.json()
        if len(profiles) == 1:
            return munchify(profiles[0])

        profile_json = {
            "name": user,
            "email": "donotreply+importer@mythica.ai",
            "description": description,
        }
        response = self.conn_pool.post(f"{self.endpoint}/v1/profiles", json=profile_json)
        response.raise_for_status()
        return munchify(response.json())

    def find_or_create_tag(self, tag_name: str):
        """Find or create a tag ID"""
        r = self.conn_pool.get(f"{self.endpoint}/v1/tags/types/asset")
        r.raise_for_status()
        for tag_obj in r.json():
            if tag_obj["name"] == tag_name:
                return tag_obj["tag_id"]

        # create tag as admin
        r = self.conn_pool.post(f"{self.endpoint}/v1/tags/",
                                json={"name": tag_name},
                                headers=self.auth_header())
        r.raise_for_status()
        return r.json()["tag_id"]

    def tag_asset(self, package: ProcessedPackageModel, tag_id):
        """Add a specific tag to an asset as the asset package owner"""
        r = self.conn_pool.post(f"{self.endpoint}/v1/tags/types/asset/",
                                json={
                                    "type_id": package.asset_id,
                                    "tag_id": tag_id},
                                headers=self.auth_header())
        r.raise_for_status()

    def find_latest_repo_version(self, package: PackageModel) -> tuple[str, list[int]]:
        """Find the latest ID, version the package repo, returns empty asset_id if none"""
        response = self.conn_pool.get(f"{self.endpoint}/v1/assets/committed_at?ref={package.repo}")
        response.raise_for_status()

        versions = munchify(response.json())
        sorted_versions = sorted(versions, key=lambda k: k['version'], reverse=True)
        if len(sorted_versions) == 0:
            return '', ZERO_VERSION
        log.info("Found %s verisons for %s", len(sorted_versions), package.name)
        log.info("Using latest version: %s", sorted_versions[0]['version'])
        latest_version = sorted_versions[0]
        return latest_version.asset_id, latest_version.version

    def auth_header(self) -> dict[str, str]:
        """Return the authorization token header"""
        return {
            "Authorization": f"Bearer {self.auth_token}"
        }

    def create_asset(self, package: PackageModel):
        """Create the asset root object"""
        asset_json = {}
        response = self.conn_pool.post(f"{self.endpoint}/v1/assets/",
                                       headers=self.auth_header(),
                                       json=asset_json)
        # If creation fails we raise an error to stop processing, there is likely something wrong
        # in the underlying configuration or permissions
        if response.status_code != 201:
            log.error("Request Error: [%s] %s", response.status_code, response.content)
            log.error("Failed to create asset for: %s", package.name)
            raise ValueError(f"Failed to create new asset, {response.status_code}, {response.content}")

        o = munchify(response.json())
        asset_id = o.asset_id
        log.info("Created assetId: %s for package: %s", asset_id, package.name)
        return asset_id

    def latest_version_exists(self, package: PackageModel) -> bool:
        """Check if the asset version already exists"""
        assert len(package.latest_version) == 3
        if package.latest_version == ZERO_VERSION:
            return False

        version_str = '.'.join(map(str, package.latest_version))
        response = self.conn_pool.get(f"{self.endpoint}/v1/assets/{package.asset_id}/versions/{version_str}")
        if response.status_code != 200:
            log.error("Version %s not found for %s (%s)",
                      version_str, package.name, package.asset_id)
            return False

        o = munchify(response.json())
        package.latest_version_contents = o.contents
        if o.version == package.latest_version:
            log.info("Skipping package %s already uploaded.", package.name)
            return True
        return False

    def update_local_github_repo(self, package: PackageModel):
        """Clone or refresh the local repo"""
        package.root_disk_path = Path(os.path.abspath(os.path.join(str(self.repo_base_dir), package.name)))
        if os.path.exists(package.root_disk_path):
            log.info("Pulling repo %s in %s", package.repo, package.root_disk_path)
            repo = git.Repo(package.root_disk_path)
            repo.git.checkout(get_default_branch(repo))
            repo.git.pull()
        else:
            log.info("Cloning repo: %s into %s",
                     package.repo, package.root_disk_path)
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

    def gather_contents(self, package: ProcessedPackageModel) -> dict[str, list[FileRef]]:
        """Gather all files to be included in the package"""
        files: list[PackageFile] = list()
        thumbnails: list[PackageFile] = list()

        # Get the readme documents and license
        files.extend(collect_doc_package_paths(package, self.license))

        # add all images
        thumbnails.extend(collect_images_paths(package))

        # add scanned files in path
        scan_path = os.path.join(package.root_disk_path, package.directory)
        for root, dirs, file_listing in os.walk(scan_path):
            for file in file_listing:
                abs_path = Path(os.path.abspath(Path(root) / file))
                package_path = as_posix_path(os.path.relpath(abs_path, package.root_disk_path))
                files.append(
                    PackageFile(
                        disk_path=abs_path,
                        package_path=package_path))

        # Perform the file uploads
        file_contents = []
        for package_file in files:
            file_contents.extend(self.maybe_upload_package_file(package, package_file))

        thumbnail_contents = []
        for package_file in thumbnails:
            thumbnail_contents.extend(self.maybe_upload_package_file(package, package_file))

        return {
            'files': file_contents,
            'thumbnails': thumbnail_contents
        }

    def maybe_upload_package_file(self,
                                  package: ProcessedPackageModel,
                                  package_file: PackageFile) -> list[FileRef]:
        """Upload a file from a package path, return its asset contents"""

        if self.ignore_spec.match_file(package_file.package_path):
            log.info("ignoring: %s", package_file.package_path)
            return []

        page_size = 64 * 1024
        sha1 = hashlib.sha1()
        with open(package_file.disk_path, "rb") as file:
            while content := file.read(page_size):
                sha1.update(content)
        existing_digest = sha1.hexdigest()

        # find an existing file if it exists that is owned by this user
        response = self.conn_pool.get(f"{self.endpoint}/v1/files/by_content/{existing_digest}",
                                      headers=self.auth_header())

        # return the file_id if the content digest already exists
        if response.status_code == HTTPStatus.OK:
            o = munchify(response.json())
            log.info("Found existing file '%s': file_id: %s, sha1: %s",
                     o.file_name, o.file_id, existing_digest)
            return [FileRef(
                file_id=o.file_id,
                file_name=o.file_name,
                content_hash=o.content_hash,
                size=o.size,
                already=True)]

        # raise on unexpected result
        if response.status_code != HTTPStatus.NOT_FOUND:
            response.raise_for_status()

        log.info("Uploading file: %s as %s, sha1: %s",
                 package_file.disk_path,
                 package_file.package_path,
                 existing_digest)

        with open(package_file.disk_path, 'rb') as f:
            upload_url = f"{self.endpoint}/v1/upload/store"
            m = MultipartEncoder(
                fields={'files': (str(package_file.package_path), f, 'application/octet-stream')}
            )
            headers = {
                **self.auth_header(),
                "Content-Type": m.content_type,
            }
            response = self.conn_pool.post(
                upload_url,
                headers=headers,
                data=m,
                timeout=3)
            response.raise_for_status()

            o = munchify(response.json())

            # validate that we're doing digest checks correctly
            file_info = o.files[0]
            assert file_info.content_hash == existing_digest
            log.info("Uploaded: %s with size: %s, sha1: %s, file_id: %s",
                     file_info.file_name,
                     file_info.size,
                     file_info.content_hash,
                     file_info.file_id)
            return [FileRef(
                file_id=file_info.file_id,
                file_name=file_info.file_name,
                content_hash=file_info.content_hash,
                size=file_info.size,
                already=False)]

    def create_version(
            self,
            package: ProcessedPackageModel,
            asset_contents: dict[str, list[FileRef]]):
        """Create new asset version"""
        json_asset_contents = {}
        for category, contents in asset_contents.items():
            json_asset_contents[category] = list(map(lambda file_ref: file_ref.model_dump(), contents))

        asset_ver_json = {
            'asset_id': package.asset_id,
            'commit_ref': f"{package.repo}/{package.commit_ref}",
            'contents': json_asset_contents,
            'name': package.name,
            'description': package.description,
            'author': package.profile_id,
            'published': True,
        }
        version_str = '.'.join(map(str, package.latest_version))
        assets_url = f"{self.endpoint}/v1/assets/{package.asset_id}/versions/{version_str}"
        response = self.conn_pool.post(assets_url,
                                       json=asset_ver_json,
                                       headers=self.auth_header())
        response.raise_for_status()

        log.info("Successfully uploaded package: %s", package.name)

        self.emit_md(package, f"uploaded as {package.name}-{package.latest_version}")
        self.stats.uploaded += 1

    def emit_md(self, package: ProcessedPackageModel, package_status: str):
        if self.markdown is None:
            return
        print(f"### {package.name}", file=self.markdown)
        print(file=self.markdown)
        print(f" - version: {package.latest_version}", file=self.markdown)
        print(f" - status: {package_status}", file=self.markdown)
        print(f" - commit_ref: {package.commit_ref}", file=self.markdown)
        print(f" - profile: {package.profile_name} {package.profile_id}", file=self.markdown)
        print(f" - org: {package.org_name} {package.org_id}", file=self.markdown)
        print(file=self.markdown)

        print("#### Files", file=self.markdown)
        print(file=self.markdown)
        print("| category | file | file_id | content_hash |", file=self.markdown)
        print("| -------- | ---- | ------- | ------------ |", file=self.markdown)

        for category, l in package.asset_contents.items():
            for file_ref in l:
                print(f"| {category} | {file_ref.file_name} | {file_ref.file_id} | {file_ref.content_hash} |",
                      file=self.markdown)
        print(file=self.markdown)

    def start_md(self):
        if self.markdown is None:
            return
        print("## Bulk Import Results", file=self.markdown)
        print(file=self.markdown)

    def end_md(self):
        if self.markdown is None:
            return
        print("## Bulk Import Finished", file=self.markdown)
        print("", file=self.markdown)
        print(f"  - {self.stats.uploaded} uploaded", file=self.markdown)
        print(f"  - {self.stats.uploaded} skipped", file=self.markdown)


def main():
    """Entrypoint"""
    with ConnectionPool() as conn_pool:
        start_uploads(conn_pool)


def load_ignore_file(file_name) -> PathSpec:
    default_ignore = """
    .DS_Store
    *.zip
    *.swp
    *.swo
    """
    if not os.path.exists(file_name):
        log.info('%s does not exist, continuing', file_name)
        return PathSpec.from_lines('gitignore', default_ignore.split())

    with open(file_name, 'r') as f:
        spec = PathSpec.from_lines('gitignore', f.readlines())
        return spec


def start_uploads(conn_pool: ConnectionPool):
    """Using the package uploader and connection pool create assets on the backend API"""

    ignore_spec = load_ignore_file('bulk-ignore.txt')
    uploader = PackageUploader(conn_pool, ignore_spec)
    uploader.parse_args()

    # start the authenticated session
    uploader.start_session()

    # load the package list
    log.info("loading package list from %s", uploader.package_list_file)
    spec = importlib.util.spec_from_file_location('package_list', uploader.package_list_file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    packages = getattr(module, 'packages', None)
    for package in packages:
        try:
            uploader.process_package(PackageModel(**package))
        except requests.exceptions.HTTPError as e:
            log.exception("uploader failed")
            log.error("response: %s", json.dumps(e.response.json(), indent=2))
            raise
        except json.decoder.JSONDecodeError as e:
            log.exception("protocol error")
            log.error("doc: %s", e.doc)
            raise
    uploader.end_md()


if __name__ == "__main__":
    main()
