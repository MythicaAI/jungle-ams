"""
Asset API schema models
"""

from typing import Optional, Self

from gcid.gcid import asset_seq_to_id, org_seq_to_id, profile_seq_to_id
from pydantic import BaseModel


class AssetVersionRef(BaseModel):
    """Represent the de-normalized asset reference data"""

    asset_id: str
    asset_seq: int
    version: list[int]

    owner_id: str
    owner_seq: int

    author_id: str
    author_seq: int

    org_id: Optional[str]
    org_seq: Optional[int]

    package_id: Optional[str]
    package_seq: Optional[int]

    @staticmethod
    def create(
        owner_seq: int,
        asset_seq: int,
        org_seq: Optional[int] = None,
        author_seq: Optional[int] = None,
        version: Optional[list[int]] = None,
        package_seq: Optional[int] = None,
    ) -> "AssetVersionRef":
        """Build an asset reference from sequences"""
        return AssetVersionRef(
            owner_seq=owner_seq,
            owner_id=profile_seq_to_id(owner_seq),
            author_seq=author_seq or owner_seq,
            author_id=profile_seq_to_id(author_seq)
            if author_seq is not None
            else profile_seq_to_id(owner_seq),
            asset_seq=asset_seq,
            asset_id=asset_seq_to_id(asset_seq),
            version=version or [0, 0, 0],
            org_seq=org_seq,
            org_id=org_seq_to_id(org_seq) if org_seq is not None else None,
            package_seq=package_seq,
            package_id=profile_seq_to_id(package_seq)
            if package_seq is not None
            else None,
        )


class AssetVersionEntryPointReference(BaseModel):
    asset_id: str
    major: int
    minor: int
    patch: int
    file_id: str
    entry_point: str
