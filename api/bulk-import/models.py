"""
Models used for bulk import
"""

from pydantic import BaseModel


class PackageModel(BaseModel):
    """Model to validate the input dictionary"""
    repo: str  # the repository URL
    directory: str  # directory where OTLs or HDAs are stored
    name: str  # the friendly name of the package
    description: str  # a short description


class ProcessedPackageModel(PackageModel):
    """Instance info filled out by resolving repo and assets"""
    asset_id: str = ''  # asset_id matching package name
    profile_id: str = ''  # profile_id for the GitHub username
    org_id: str = ''  # org_id for the GitHub username
    latest_version: list[int] = list()  # latest matching package version
    latest_github_version: list[int] = list()  # populated with newest GitHub release version
    commit_ref: str = ''  # commit reference for the imported assets
    root_disk_path: str = ''  # absolute path on disk to root of GitHub repo
    latest_version_contents: dict[str, dict] = {}  # latest contents from API version query
