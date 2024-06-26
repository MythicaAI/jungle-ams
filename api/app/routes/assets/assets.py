import json
import logging
from typing import Optional, Dict

from pydantic.types import StrictInt
from datetime import datetime
from http import HTTPStatus
from uuid import UUID

import sqlalchemy
from fastapi import APIRouter, HTTPException, Depends, Response, status
from sqlmodel import select, update, insert, Session

from config import app_config
from content.locate_content import locate_content_by_id
from db.schema.assets import Asset, AssetVersion
from db.schema.events import Event
from db.schema.media import FileContent
from db.connection import get_session

from pydantic import BaseModel

from db.schema.profiles import Profile, Org
from routes.authorization import current_profile

ZERO_ID = UUID(int=0, version=4)
ZERO_VERSION = (0, 0, 0)
VERSION_LEN = 3

log = logging.getLogger(__name__)

router = APIRouter(prefix="/assets", tags=["assets"])

asset_join_select = select(Asset, AssetVersion)

VersionTuple = tuple[StrictInt, StrictInt, StrictInt]


class AssetCreateRequest(BaseModel):
    org_id: Optional[UUID] = None


class AssetVersionContent(BaseModel):
    """Embedded content in an asset version. When creating a new asset version
    it is only required to specify the ID of the file media and the relative
    file name of the content in the package. When the file is resolved during the
    creation of the version it will receive the content hash and size from the underlying
    file_id"""
    file_id: UUID
    file_name: str
    content_hash: Optional[str] = None
    size: Optional[int] = None


class AssetCreateVersionRequest(BaseModel):
    """Create a new version of an asset with its contents"""
    author: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    published: Optional[bool] = False
    commit_ref: Optional[str] = None
    contents: Optional[Dict[str, list[AssetVersionContent]]] = None


class AssetCreateResult(BaseModel):
    """Request object to create a new asset head object. This object
    is used to store multiple versions of the versioned asset and associate
    it with an organization"""
    id: UUID
    org_id: Optional[UUID] = None
    owner: UUID


class AssetVersionResult(BaseModel):
    """Result object for a specific asset version or the asset head object
    when no version has been created. In this case the """
    asset_id: UUID
    owner: UUID
    org_id: UUID | None = None
    package_id: UUID | None = None
    author: UUID | None = None
    name: str | None = None
    description: str | None = None
    published: bool | None = False
    version: tuple[int, ...] = ZERO_VERSION
    commit_ref: Optional[str] = None
    created: datetime | None = None
    contents: Dict[str, list[AssetVersionContent]] = {}


def process_join_results(join_results: list[tuple[Asset, AssetVersion]]) -> list[AssetVersionResult]:
    """Process the join result of Asset, AssetVersion and FileContent tables"""
    results = list()
    for join_result in join_results:
        asset, ver = join_result
        if ver is None:
            # outer join didn't find a version
            ver = AssetVersion(major=0, minor=0, patch=0, created=None, contents={})
        avr = AssetVersionResult(
            asset_id=asset.id,
            org_id=asset.org_id,
            owner=asset.owner,
            package_id=ver.package_id,
            author=ver.author,
            name=ver.name,
            description=ver.description,
            published=ver.published,
            version=(ver.major, ver.minor, ver.patch),
            commit_ref=ver.commit_ref,
            created=ver.created,
            contents=asset_contents_json_to_model(ver.contents))
        results.append(avr)
    return results


def convert_version_input(version: str) -> tuple[int, ...]:
    """Convert a raw version string to a 3 part number tuple"""
    try:
        tuple_version = tuple(map(int, version.split('.')))
        if len(tuple_version) != VERSION_LEN:
            raise HTTPException(HTTPStatus.BAD_REQUEST,
                                detail="version must conform to 1.2.3")
    except TypeError or ValueError as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail="version string was malformed") from e
    return tuple_version


def select_asset_version(session: Session,
                         asset_id: UUID,
                         version: tuple[int, ...]) -> AssetVersionResult | None:
    """Execute a select against the asset versions table"""
    if version == ZERO_VERSION:
        asset = session.exec(select(Asset).where(
            Asset.id == asset_id)).first()
        if asset is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset {asset_id} found")
        results = [(asset, AssetVersion(
                major=0,
                minor=0,
                patch=0,
                created=None,
                contents={}))]
    else:
        results = session.exec(select(Asset, AssetVersion).outerjoin(
            AssetVersion, Asset.id == AssetVersion.asset_id).where(
            Asset.id == asset_id).where(
            AssetVersion.major == version[0]).where(
            AssetVersion.minor == version[1]).where(
            AssetVersion.patch == version[2])).all()
    if not results:
        return None
    processed_results = process_join_results(results)
    return processed_results[0]


def add_version_packaging_event(session: Session, avr: AssetVersionResult):
    """Add a new event that triggers version packaging"""
    # Create a new pipeline event
    job_data = {
        'owner': str(avr.owner),
        'author': str(avr.author),
        'asset_id': str(avr.asset_id),
        'version': avr.version,
        'published': avr.published,
    }
    location = app_config().mythica_location
    stmt = insert(Event).values(
        event_type="asset_version_updated",
        job_data=job_data,
        owner=avr.owner,
        created_in=location,
        affinity=location)
    event_result = session.exec(stmt)
    log.info(f"packaging event for {avr.asset_id} by {avr.owner} -> {event_result}")
    return event_result


def asset_contents_json_to_model(contents: dict[str, list[str]]) -> dict[str, list[AssetVersionContent]]:
    """Convert JSON assert version contents to model objects"""
    converted = {}
    for category, content_list in contents.items():
        converted[category] = list(map(lambda s: AssetVersionContent(**json.loads(s)), content_list))
    return converted


@router.get('/all')
async def get_assets() -> list[AssetVersionResult]:
    """Get all asset versions"""
    with get_session() as session:
        join_results = session.exec(
            asset_join_select.where(
                Asset.id == AssetVersion.asset_id).where(
                AssetVersion.file_id == FileContent.id)).all()
        return process_join_results(join_results)


@router.get('/owned')
async def get_owned_assets(
        profile: Profile = Depends(current_profile)) -> list[AssetVersionResult]:
    """Get the list of asset headers owned by the current profile"""
    with get_session() as session:
        results = session.exec(
            select(Asset, AssetVersion)
                .outerjoin(AssetVersion, Asset.id == AssetVersion.asset_id)
                .where(Asset.owner == profile.id)).all()
        return process_join_results(results)


@router.get('/named/{asset_name}')
async def get_asset_by_name(asset_name) -> list[AssetVersionResult]:
    """Get asset by name"""
    with get_session() as session:
        return process_join_results(session.exec(
            asset_join_select.where(
                Asset.id == AssetVersion.asset_id,
                AssetVersion.name == asset_name)).all())


@router.get('/{asset_id}')
async def get_asset_by_id(asset_id: UUID) -> list[AssetVersionResult]:
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
                raise HTTPException(HTTPStatus.NOT_FOUND, f"org {r.org_id} not found")

        asset_result = session.exec(insert(Asset).values(
            org_id=r.org_id, owner=profile.id))
        asset_id = asset_result.inserted_primary_key[0]
        session.commit()
        return AssetCreateResult(id=asset_id, org_id=r.org_id, owner=profile.id)


@router.post('/{asset_id}/versions/{version_str}')
async def create_asset_version(asset_id: UUID,
                               version_str: str,
                               r: AssetCreateVersionRequest,
                               response: Response,
                               profile: Profile = Depends(current_profile)) \
            -> AssetVersionResult:
    """Create or update a single asset version"""
    version_id = convert_version_input(version_str)
    if version_id == ZERO_VERSION:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail="versions with all zeros are not allowed")
    if not r.contents:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=f"asset '{asset_id}' missing content")

    with get_session(echo=True) as session:
        # Validate asset ID
        asset = session.exec(select(Asset).where(Asset.id == asset_id)).first()
        if asset is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{asset_id}' not found")

        contents = {}
        for category, content_list in r.contents.items():
            resolved_content_list = []
            for asset_content in content_list:
                try:
                    file = locate_content_by_id(session, asset_content.file_id)
                    content = AssetVersionContent(
                        file_id=file.id,
                        file_name=asset_content.file_name,
                        content_hash=file.content_hash,
                        size=file.size)
                    resolved_content_list.append(content.model_dump_json())
                except FileNotFoundError as exc:
                    raise HTTPException(HTTPStatus.NOT_FOUND,
                                        detail=f"file '{asset_content.file_id}' not found") from exc
            contents[category] = resolved_content_list

        # Create the revision, fails if the revision already exists
        try:
            # TODO: replace with upsert
            avr = select_asset_version(session, asset_id, version_id)

            # Use provided author or default to calling profile
            author = r.author or profile.id
            if avr is None:
                stmt = insert(AssetVersion).values(
                    asset_id=asset.id,
                    major=version_id[0],
                    minor=version_id[1],
                    patch=version_id[2],
                    commit_ref=r.commit_ref,
                    contents=contents,
                    name=r.name,
                    author=author)
                response.status_code = status.HTTP_201_CREATED
            else:
                stmt = update(AssetVersion).values(
                    commit_ref=r.commit_ref,
                    contents=contents,
                    name=r.name,
                    description=r.description,
                    published=r.published,
                    author=author).where(
                        Asset.id == asset.id).where(
                        AssetVersion.major == version_id[0]).where(
                        AssetVersion.minor == version_id[1]).where(
                        AssetVersion.patch == version_id[2])
            session.exec(stmt)

            # insert event
            session.commit()
            read_back = select_asset_version(session, asset_id, version_id)

            result = AssetVersionResult(
                asset_id=asset.id,
                owner=asset.owner,
                org_id=asset.org_id,
                package_id=read_back.package_id,
                published=read_back.published,
                author=read_back.author,
                name=read_back.name,
                description=read_back.description,
                version=read_back.version,
                commit_ref=read_back.commit_ref,
                created=read_back.created,
                contents=read_back.contents)

            add_version_packaging_event(session, result)
            session.commit()

            return result
        except sqlalchemy.exc.IntegrityError as exc:
            detail = (f'asset: {asset.id} '
                      f'version {version_id} exists')
            raise HTTPException(HTTPStatus.CONFLICT, detail=detail) from exc


@router.get('/{asset_id}/versions/{version_str}')
async def get_asset_version_by_id(
        asset_id: UUID,
        version_str: str) -> AssetVersionResult:
    """Get the asset version for a given asset and version"""
    version_id = convert_version_input(version_str)
    with get_session() as session:
        version = select_asset_version(session, asset_id, version_id)
        if version is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{asset_id}', version {version_id} not found")
        return version
