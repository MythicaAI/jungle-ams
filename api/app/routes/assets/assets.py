from pydantic.v1.types import StrictInt
from pydantic import conlist
from datetime import datetime
from http import HTTPStatus
from typing import Dict, Any, List, Tuple
from uuid import UUID

import sqlalchemy
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select, update, insert

from auth.data import get_profile
from content.locate_content import locate_content_by_id
from db.schema.assets import Asset, AssetVersion
from db.schema.media import FileContent
from db.connection import get_session

from pydantic import BaseModel, ValidationError

from db.schema.profiles import Profile

ZERO_ID = UUID(int=0, version=4)

router = APIRouter(prefix="/assets", tags=["assets"])

asset_join_select = select(Asset, AssetVersion, FileContent)

VersionTuple = tuple[StrictInt, StrictInt, StrictInt]


class AssetCreateRequest(BaseModel):
    id: UUID
    collection_id: UUID | None = None


class AssetCreateVersionRequest(BaseModel):
    author_id: UUID
    name: str
    commit_ref: str | None = None
    contents: list[UUID] = conlist(UUID, min_length=0, max_length=1000)  # file IDs


class AssetCreateResult(BaseModel):
    asset_id: UUID
    file_id: UUID
    content_hash: str
    size: int
    author: UUID
    version: list[int]


class AssetVersionResult(BaseModel):
    asset_id: UUID
    collection_id: UUID | None = None
    package_id: UUID | None = None
    author: UUID
    name: str
    version: List[int]
    commit_ref: str | None = None
    created: datetime = None
    contents: List[Any] | None = None


class AssetHeadResult(BaseModel):
    id: UUID | None = None
    collection_id: UUID | None = None
    versions: List[AssetVersionResult] = list()

    def __hash__(self):
        return hash(self.id)


def process_join_results(join_results) -> list[AssetHeadResult]:
    """Process the join result of Asset, AssetVersion and FileContent tables"""
    results_by_asset = dict()
    for join_result in join_results:
        asset, ver, file = join_result
        asset_head = results_by_asset.setdefault(
            asset.id, AssetHeadResult(id=asset.id, collection_id=asset.collection_id))
        asset_version = AssetVersionResult(
            version=[ver.major, ver.minor, ver.patch],
            owner=asset.owner,
            author=ver.created,
            file_id=file.id,
            content_hash=file.content_hash,
            size=file.size,
            friendly_name=ver.friendly_name,
            tags=ver.tags)
        asset_head.versions.append(asset_version)
    return [r.model_dump() for r in results_by_asset.values()]


@router.get('/all')
async def get_assets() -> list[AssetHeadResult]:
    with get_session() as session:
        join_results = session.exec(
            asset_join_select.where(
                Asset.id == AssetVersion.asset_id).where(
                AssetVersion.file_id == FileContent.id)).all()
        return process_join_results(join_results)


@router.get('/named/{asset_name}')
async def get_asset_by_name(asset_name) -> list[AssetHeadResult]:
    """Get asset by name"""
    with get_session() as session:
        return process_join_results(session.exec(asset_join_select.where(Asset.name == asset_name)))


@router.get('/{asset_id}')
async def get_asset_by_id(asset_id) -> list[AssetHeadResult]:
    """Get asset by id"""
    with get_session() as session:
        db_results = session.exec(
            asset_join_select.where(
                Asset.id == asset_id).where(
                Asset.id == AssetVersion.asset_id).where(
                AssetVersion.file_id == FileContent.id))
        return process_join_results(db_results)


@router.post('/create')
async def create_asset(r: AssetCreateRequest,
                       profile: Profile = Depends(get_profile)) -> Asset:
    """Create a new asset for storing revisions or other assets"""
    with get_session() as session:
        # If the user passes a collection ID ensure that it exists
        if r.collection_id is not None:
            col_result = session.exec(select(Asset).where(Asset.id == r.collection_id)).one_or_none()
            if col_result is None:
                raise HTTPException(HTTPStatus.NOT_FOUND, f"collection {r.collection_id} not found")

        asset_result = session.exec(insert(Asset).values(**r.model_dump()))
        asset_id = asset_result.inserted_primary_key[0]
        return Asset(id=asset_id, collection_id=r.collection_id)


@router.post('/create/{asset_id}/versions/{version_id}')
async def create_asset_version(asset_id: UUID,
                               version_id: VersionTuple,
                               r: AssetCreateVersionRequest,
                               profile: Profile = Depends(get_profile)) -> AssetVersionResult:
    """Create or update a single asset version"""
    with get_session() as session:
        # Validate asset ID
        asset = session.exec(select(Asset).where(Asset.id == asset_id)).one_or_none()
        if asset is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{r.asset_id}' not found")

        # Validate and load contents
        contents = list()
        for file_id in r.contents:
            try:
                file = locate_content_by_id(session, file_id)
                contents.append({'file_id': file_id, 'content_hash': file.content_hash, 'size': file.size})
            except FileNotFoundError:
                raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"file '{file_id}' not found")

        # Create the revision, fails if the revision already exists
        try:
            stmt = insert(AssetVersion).values(
                asset_id=asset.id,
                major=version_id[0],
                minor=version_id[1],
                patch=version_id[2],
                commit_ref=r.commit_ref,
                contents=contents,
                name=r.name,
                author=profile.id)
            stmt.on_conflict_do_update(
                index_elements=[Asset.id, AssetVersion.major, AssetVersion.minor, AssetVersion.patch],
                values={
                    'commit_ref': r.commit_ref,
                    'contents': contents,
                    'name': r.name,
                    'author': profile.id
                })
            session.exec(stmt)
        except sqlalchemy.exc.IntegrityError as _:
            raise HTTPException(HTTPStatus.CONFLICT,
                                detail=f'asset: {asset.id} version {[r.major, r.minor, r.patch]} exists')
        session.commit()
    return AssetVersionResult(asset_id=asset.id,
                              collection_id=asset.collection_id,
                              package_id=None,
                              author=profile.id,
                              name=r.name,
                              version=version_id,
                              commit_ref=r.commit_ref,
                              created=r.created,
                              contents=contents)


@router.get('/assets/{asset_id}/versions/{version_id}')
async def get_asset_version_by_id(asset_id: UUID, version_id: VersionTuple) -> AssetVersionResult:
    """Get the asset version for a given asset and version"""
    with get_session() as session:
        asset = session.exec(select(Asset).where(Asset.id == asset_id)).one_or_none()
        if asset is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{asset_id}' not found")

        version = session.exec(select(AssetVersion)).where(
            Asset.id == asset_id).where(
            AssetVersion.version == version_id).first()
        if version is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{asset_id}', version {version_id} not found")

        return AssetVersionResult(
            asset_id=asset.id,
            collection_id=asset.collection_id,
            author_id=version.author_id,
            package_id=version.package_id,
            name=version.name,
            version=[version.major, version.minor, version.patch],
            commit_ref=version.commit_ref,
            created=version.created,
            contents=version.contents)
