"""
Models used for bulk import
"""
from pathlib import Path, PurePosixPath
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class PackageFile(BaseModel):
    """Model of a file for uploading into a relative package path"""
    disk_path: Path
    package_path: PurePosixPath


class PackageModel(BaseModel):
    """Model to validate the input dictionary"""
    repo: str  # the repository URL
    directory: str  # directory where OTLs or HDAs are stored
    name: str  # the friendly name of the package
    description: str  # a short description
    user: Optional[str] = None  # user name override


class ProcessedPackageModel(PackageModel):
    """Instance info filled out by resolving repo and assets"""
    asset_id: str = ''  # asset_id matching package name
    profile_id: str = ''  # profile_id for the GitHub username
    org_id: str = ''  # org_id for the GitHub username
    latest_version: List[int] = Field(default_factory=list)  # latest matching package version
    latest_github_version: List[int] = Field(
        default_factory=lambda: [0, 0, 0])  # populated with the newest GitHub release version
    commit_ref: str = ''  # commit reference for the imported assets
    root_disk_path: Path | None = None  # absolute path on disk to root of GitHub repo
    latest_version_contents: Dict[str, dict] = Field(default_factory=dict)  # latest contents from API version query
