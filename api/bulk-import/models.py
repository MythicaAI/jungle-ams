"""
Models used for bulk import
"""
from datetime import datetime
from pathlib import Path, PurePosixPath
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class PackageFile(BaseModel):
    """Model of a file for uploading into a relative package path"""
    disk_path: Path
    package_path: PurePosixPath


class FileRef(BaseModel):
    """Model of an uploaded file"""
    file_id: str
    file_name: str
    content_hash: str
    size: int
    already: bool


class PackageModel(BaseModel):
    """Model to validate the input dictionary"""
    repo: str  # the repository URL
    directory: str | None = None  # directory where OTLs or HDAs are stored
    hdas: list[str] | None = None  # path patterns for run time files
    docs: list[str] | None = None  # path patterns for docs, extra files for full distribution
    thumbnails: list[str] | None = None  # input patterns, file names or paths in order
    name: str  # the friendly name of the package
    description: str  # a short description
    blurb: Optional[str] = None  # a short headline
    user: Optional[str] = None  # user name override


class ProcessedPackageModel(PackageModel):
    """Instance info filled out by resolving repo and assets"""
    asset_id: str = ''  # asset_id matching package name
    published: bool = False  # true when the published flag is set
    profile_id: str = ''  # profile_id for the GitHub username
    profile_name: str = ''
    profile_email: str = ''
    org_id: str = ''  # org_id for the named org that was passed in
    org_name: str = ''
    created: Optional[datetime] = None
    updated: Optional[datetime] = None
    latest_version: List[int] | None = None  # latest matching package version
    latest_github_commit_hash: str | None = None  # last queried commit hash
    latest_github_version: List[int] | None = None  # populated with the newest GitHub release version
    latest_p4_change_list: int | None = None  # populated with the most recent cl# commit ref
    commit_ref: str = ''  # commit reference for the imported assets
    root_disk_path: Path | None = None  # absolute path on disk to root of GitHub repo
    latest_version_contents: Dict[str, dict] = Field(default_factory=dict)  # latest contents from API version query
    asset_contents: dict[str, list[FileRef]] = Field(default_factory=dict)


class OrgResponse(BaseModel):
    """Response from the org find or create operation"""
    org_id: str
    name: str
    description: str | None = None
    created: datetime | None = None
