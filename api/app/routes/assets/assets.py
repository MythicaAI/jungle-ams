from pydantic.types import StrictInt
from pydantic import conlist
from datetime import datetime
from http import HTTPStatus
from uuid import UUID

import sqlalchemy
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlmodel import select, update, insert, Session

from content.locate_content import locate_content_by_id
from db.schema.assets import Asset, AssetVersion
from db.schema.media import FileContent
from db.connection import get_session

from pydantic import BaseModel

from db.schema.profiles import Profile, Org
from routes.authorization import current_profile

ZERO_ID = UUID(int=0, version=4)
VERSION_LEN = 3

router = APIRouter(prefix="/assets", tags=["assets"])

asset_join_select = select(Asset, AssetVersion)

VersionTuple = tuple[StrictInt, StrictInt, StrictInt]


class AssetCreateRequest(BaseModel):
    org_id: UUID | None = None


class AssetCreateVersionRequest(BaseModel):
    author: UUID
    name: str
    commit_ref: str | None = None
    contents: conlist(UUID, min_length=0, max_length=1000) = list()  # file IDs


class AssetCreateResult(BaseModel):
    id: UUID
    org_id: UUID | None = None
    owner: UUID


class AssetVersionContent(BaseModel):
    file_id: UUID
    file_name: str
    content_hash: str
    size: int


class AssetVersionResult(BaseModel):
    asset_id: UUID
    org_id: UUID | None = None
    package_id: UUID | None = None
    author: UUID
    name: str
    version: tuple[int, ...]
    commit_ref: str | None = None
    created: datetime = None
    contents: list[AssetVersionContent] | None = None


def process_join_results(join_results) -> list[AssetVersionResult]:
    """Process the join result of Asset, AssetVersion and FileContent tables"""
    results = list()
    for join_result in join_results:
        asset, ver = join_result
        avr = AssetVersionResult(
            asset_id=asset.id,
            org_id=asset.org_id,
            package_id=ver.package_id,
            author=ver.author,
            name=ver.name,
            version=(ver.major, ver.minor, ver.patch),
            commit_ref=ver.commit_ref,
            created=ver.created,
            contents=ver.contents)
        results.append(avr)
    return results


def convert_version_input(version: str) -> tuple[int, ...]:
    tuple_version = tuple(map(int, version.split('.')))
    if len(tuple_version) != VERSION_LEN:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail="version must conform to 1.2.3")
    return tuple_version


def select_asset_version(session: Session,
                         asset_id: UUID,
                         version: tuple[int, ...]) -> AssetVersion:
    return session.exec(select(AssetVersion).where(
        AssetVersion.asset_id == asset_id).where(
        AssetVersion.major == version[0]).where(
        AssetVersion.minor == version[1]).where(
        AssetVersion.patch == version[2])).first()


@router.get('/all')
async def get_assets() -> list[AssetVersionResult]:
    with get_session() as session:
        join_results = session.exec(
            asset_join_select.where(
                Asset.id == AssetVersion.asset_id).where(
                AssetVersion.file_id == FileContent.id)).all()
        return process_join_results(join_results)


@router.get('/named/{asset_name}')
async def get_asset_by_name(asset_name) -> list[AssetVersionResult]:
    """Get asset by name"""
    with get_session() as session:
        return process_join_results(session.exec(asset_join_select.where(
            Asset.name == asset_name)))


@router.get('/{asset_id}')
async def get_asset_by_id(asset_id) -> list[AssetVersionResult]:
    """Get asset by id"""
    with get_session() as session:
        return process_join_results(session.exec(
            asset_join_select.where(
                Asset.id == asset_id).where(
                Asset.id == AssetVersion.asset_id)))


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_asset(r: AssetCreateRequest,
                       profile: Profile = Depends(current_profile)
                       ) -> AssetCreateResult:
    """Create a new asset for storing revisions or other assets"""
    with get_session() as session:
        # If the user passes a collection ID ensure that it exists
        if r.org_id is not None:
            col_result = session.exec(select(Org).where(
                Org.id == r.org_id)).one_or_none()
            if col_result is None:
                raise HTTPException(HTTPStatus.NOT_FOUND, f"org {
                                    r.org_id} not found")

        asset_result = session.exec(insert(Asset).values(
            org_id=r.org_id, owner=profile.id))
        asset_id = asset_result.inserted_primary_key[0]
        session.commit()
        return AssetCreateResult(id=asset_id, org_id=r.org_id, owner=profile.id)


@router.post('/{asset_id}/versions/{version_str}',
             status_code=HTTPStatus.CREATED)
async def create_asset_version(asset_id: UUID,
                               version_str: str,
                               r: AssetCreateVersionRequest,
                               response: Response,
                               profile: Profile = Depends(current_profile)
                               ) -> AssetVersionResult:
    """Create or update a single asset version"""
    version_id = convert_version_input(version_str)
    with get_session() as session:
        # Validate asset ID
        asset = session.exec(select(Asset).where(Asset.id == asset_id)).first()
        if asset is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{
                                asset_id}' not found")

        # Validate and load contents
        contents = list()
        for file_id in r.contents:
            try:
                file = locate_content_by_id(session, file_id)
                contents.append(
                    {'file_id': str(file_id),
                     'file_name': file.name,
                     'content_hash': file.content_hash,
                     'size': file.size})
            except FileNotFoundError as exc:
                raise HTTPException(HTTPStatus.NOT_FOUND,
                                    detail=f"file '{file_id}' not found") from exc

        # Create the revision, fails if the revision already exists
        try:
            # TODO: replace with upsert
            version = select_asset_version(session, asset_id, version_id)
            if version is None:
                stmt = insert(AssetVersion).values(
                    asset_id=asset.id,
                    major=version_id[0],
                    minor=version_id[1],
                    patch=version_id[2],
                    commit_ref=r.commit_ref,
                    contents=contents,
                    name=r.name,
                    author=profile.id)
            else:
                stmt = update(AssetVersion).values(
                    commit_ref=r.commit_ref,
                    contents=contents,
                    name=r.name,
                    author=profile.id).where(
                        Asset.id == asset.id).where(
                        AssetVersion.major == version_id[0]).where(
                        AssetVersion.minor == version_id[1]).where(
                        AssetVersion.patch == version_id[2])
            session.exec(stmt)
            session.commit()
            version = select_asset_version(session, asset_id, version_id)
            response.status = HTTPStatus.OK
            return AssetVersionResult(asset_id=asset.id,
                                      org_id=asset.org_id,
                                      package_id=version.package_id,
                                      author=version.author,
                                      name=version.name,
                                      version=(version.major,
                                               version.minor, version.patch),
                                      commit_ref=version.commit_ref,
                                      created=version.created,
                                      contents=version.contents)
        except sqlalchemy.exc.IntegrityError as exc:
            detail = (f'asset: {asset.id} '
                      'version {[r.major, r.minor, r.patch]} exists')
            raise HTTPException(HTTPStatus.CONFLICT, detail=detail) from exc


@router.get('/{asset_id}/versions/{version_str}')
async def get_asset_version_by_id(
        asset_id: UUID,
        version_str: str) -> AssetVersionResult:
    """Get the asset version for a given asset and version"""
    version_id = convert_version_input(version_str)
    with get_session() as session:
        asset = session.exec(select(Asset).where(Asset.id == asset_id)).first()
        if asset is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{
                                asset_id}' not found")

        version = select_asset_version(session, asset.id, version_id)
        if version is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{
                                asset_id}', version {version_id} not found")

        return AssetVersionResult(
            asset_id=asset.id,
            org_id=asset.org_id,
            author=version.author,
            package_id=version.package_id,
            name=version.name,
            version=[version.major, version.minor, version.patch],
            commit_ref=version.commit_ref,
            created=version.created,
            contents=version.contents)
