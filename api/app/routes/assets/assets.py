import json
import logging
from datetime import datetime
from http import HTTPStatus
from operator import or_
from typing import Optional, Dict

import sqlalchemy
from fastapi import APIRouter, HTTPException, Depends, Response, status
from pydantic import BaseModel
from pydantic.types import StrictInt
from sqlmodel import select, update, insert, delete, Session, desc, col

from auth.api_id import asset_seq_to_id, profile_seq_to_id, org_seq_to_id, file_seq_to_id, asset_id_to_seq, \
    profile_id_to_seq, file_id_to_seq, org_id_to_seq
from config import app_config
from content.locate_content import locate_content_by_seq
from db.connection import get_session
from db.schema.assets import Asset, AssetVersion
from db.schema.events import Event
from db.schema.media import FileContent
from db.schema.profiles import Profile, Org
from routes.authorization import current_profile

ZERO_VERSION = (0, 0, 0)
VERSION_LEN = 3

log = logging.getLogger(__name__)

router = APIRouter(prefix="/assets", tags=["assets"])

asset_join_select = select(Asset, AssetVersion)

VersionTuple = tuple[StrictInt, StrictInt, StrictInt]


class AssetCreateRequest(BaseModel):
    org_id: Optional[str] = None


class AssetVersionContent(BaseModel):
    """Embedded content in an asset version. When creating a new asset version
    it is only required to specify the ID of the file media and the relative
    file name of the content in the package. When the file is resolved during the
    creation of the version it will receive the content hash and size from the underlying
    file_id"""
    file_id: str
    file_name: str
    content_hash: Optional[str] = None
    size: Optional[int] = None


# Shorthand for a shallow document that contains pre-serialized JSON
AssetContentDocument = dict[str, list[str]]


class AssetCreateVersionRequest(BaseModel):
    """Create a new version of an asset with its contents"""
    author_id: Optional[str] = None
    org_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    published: Optional[bool] = False
    commit_ref: Optional[str] = None
    contents: Optional[dict[str, list[AssetVersionContent]]] = None


class AssetCreateResult(BaseModel):
    """Request object to create a new asset head object. This object
    is used to store multiple versions of the versioned asset and associate
    it with an organization"""
    asset_id: str
    org_id: Optional[str] = None
    owner_id: str


class AssetVersionResult(BaseModel):
    """Result object for a specific asset version or the asset head object
    when no version has been created. In this case the """
    asset_id: str
    owner_id: str
    owner_name: str
    org_id: str | None = None
    org_name: str | None = None
    package_id: str | None = None
    author_id: str | None = None
    author_name: str | None = None
    name: str | None = None
    description: str | None = None
    published: bool | None = False
    version: tuple[int, ...] = ZERO_VERSION
    commit_ref: Optional[str] = None
    created: datetime | None = None
    contents: Dict[str, list[AssetVersionContent]] = {}


def resolve_profile_name(session: Session, profile_seq: int) -> str:
    """Convert profile_id to profile name"""
    profile = (session.exec(select(Profile)
                            .where(Profile.profile_seq == profile_seq))
               .one_or_none())
    if profile:
        return profile.name
    return ""


def resolve_org_name(session: Session, org_seq: int) -> str:
    """Convert org_id to org name"""
    org = session.exec(select(Org).where(Org.org_seq == org_seq)).one_or_none()
    if org:
        return org.name
    return ""


def process_join_results(session: Session, join_results: list[tuple[Asset, AssetVersion]]) -> list[AssetVersionResult]:
    """Process the join result of Asset, AssetVersion and FileContent tables"""
    results = list()
    for join_result in join_results:
        asset, ver = join_result
        if ver is None:
            # outer join or joined load didn't find a version
            ver = AssetVersion(major=0, minor=0, patch=0, created=None, contents={})
        avr = AssetVersionResult(
            asset_id=asset_seq_to_id(asset.asset_seq),
            org_id=org_seq_to_id(asset.org_seq),
            org_name=resolve_org_name(session, asset.org_seq),
            owner_id=profile_seq_to_id(asset.owner_seq),
            owner_name=resolve_profile_name(session, asset.owner_seq),
            package_id=file_seq_to_id(ver.package_seq),
            author_id=profile_seq_to_id(ver.author_id),
            author_name=resolve_profile_name(session, ver.author_seq),
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
    except (TypeError, ValueError) as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail="version string was malformed") from e
    return tuple_version


def select_asset_version(session: Session,
                         asset_id: str,
                         version: tuple[int, ...]) -> AssetVersionResult | None:
    """Execute a select against the asset versions table"""
    if version == ZERO_VERSION:
        asset = session.exec(select(Asset).where(
            Asset.asset_seq == asset_id_to_seq(asset_id))).first()
        if asset is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset {asset_id} found")
        results = [(asset, AssetVersion(
            major=0,
            minor=0,
            patch=0,
            created=None,
            contents={}))]
    else:
        stmt = select(Asset, AssetVersion).outerjoin(AssetVersion,
                                                     (Asset.asset_seq == AssetVersion.asset_seq) &
                                                     (AssetVersion.major == version[0]) &
                                                     (AssetVersion.minor == version[1]) &
                                                     (AssetVersion.patch == version[2])).where(
            Asset.asset_seq == asset_id_to_seq(asset_id))

        results = session.exec(stmt).all()
    if not results:
        return None
    processed_results = process_join_results(session, results)
    return processed_results[0]


def add_version_packaging_event(session: Session, avr: AssetVersionResult):
    """Add a new event that triggers version packaging"""
    # Create a new pipeline event
    job_data = {
        'owner': avr.owner_id,
        'author': avr.author_id,
        'asset_id': avr.asset_id,
        'version': avr.version,
        'published': avr.published,
    }
    location = app_config().mythica_location
    stmt = insert(Event).values(
        event_type="asset_version_updated",
        job_data=job_data,
        owner_seq=profile_id_to_seq(avr.owner_seq),
        created_in=location,
        affinity=location)
    event_result = session.exec(stmt)
    log.info("packaging event for %s by %s -> %s",
             avr.asset_id, avr.owner_id, event_result)
    return event_result


def asset_contents_json_to_model(contents: dict[str, list[str]]) -> dict[str, list[AssetVersionContent]]:
    """Convert JSON assert version contents to model objects"""
    converted = {}
    if type(contents) is not dict:
        return converted
    for category, content_list in contents.items():
        converted[category] = list(map(lambda s: AssetVersionContent(**json.loads(s)), content_list))
    return converted


def resolve_contents_as_json(
        session: Session,
        in_files_categories: dict[str, list[AssetVersionContent]]) \
        -> AssetContentDocument:
    """Convert any partial content references into fully resolved references"""
    contents = {}

    # resolve all file content types
    for category, content_list in in_files_categories.items():
        resolved_content_list = []
        for asset_content in content_list:
            try:
                db_file = locate_content_by_seq(session, file_id_to_seq(asset_content.file_id))
                content = AssetVersionContent(
                    file_id=file_seq_to_id(db_file.file_seq),
                    file_name=asset_content.file_name,
                    content_hash=db_file.content_hash,
                    size=db_file.size)
                resolved_content_list.append(content.model_dump_json())
            except FileNotFoundError as exc:
                raise HTTPException(HTTPStatus.NOT_FOUND,
                                    detail=f"file '{asset_content.file_id}' not found") from exc
        contents[category] = resolved_content_list

    return contents


@router.get('/all')
async def get_assets() -> list[AssetVersionResult]:
    """Get all asset versions"""
    with get_session() as session:
        join_results = session.exec(
            asset_join_select.where(
                Asset.asset_seq == AssetVersion.asset_seq)).all()
        return process_join_results(session, join_results)


@router.get('/top')
async def get_top_assets() -> list[AssetVersionResult]:
    """Get the list of asset headers top of the current profile"""
    with get_session() as session:
        results = session.exec(
            select(Asset, AssetVersion)
            .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
            .outerjoin(FileContent, FileContent.file_seq == AssetVersion.package_seq)
            .where(AssetVersion.published == True)
            .where(AssetVersion.package_seq != None)
            .order_by(desc(FileContent.downloads))
        ).all()
        return process_join_results(session, results)


@router.get('/owned')
async def get_owned_assets(
        profile: Profile = Depends(current_profile)) -> list[AssetVersionResult]:
    """Get the list of asset headers owned by the current profile"""
    with get_session() as session:
        results = session.exec(
            select(Asset, AssetVersion)
            .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
            .where(Asset.owner_seq == profile.profile_seq)).all()
        return process_join_results(session, results)


@router.get('/named/{asset_name}')
async def get_asset_by_name(asset_name) -> list[AssetVersionResult]:
    """Get asset by name"""
    with get_session() as session:
        return process_join_results(session, session.exec(
            asset_join_select.where(
                Asset.asset_seq == AssetVersion.asset_seq,
                AssetVersion.name == asset_name)).all())


@router.get('/committed_at')
async def get_assets_by_ref(ref: str) -> list[AssetVersionResult]:
    """Find any asset versions with commit_ref containing ref"""
    with get_session() as session:
        return process_join_results(session, session.exec(
            asset_join_select.where(Asset.asset_seq == AssetVersion.asset_seq).where(
                col(AssetVersion.commit_ref).contains(ref))).all())  # pylint: disable=no-member


@router.get('/{asset_id}')
async def get_asset_by_id(asset_id: str) -> list[AssetVersionResult]:
    """Get asset by id"""
    with get_session() as session:
        results = session.exec(select(Asset, AssetVersion).outerjoin(
            AssetVersion, Asset.asset_seq == AssetVersion.asset_seq).where(
            Asset.asset_seq == asset_id_to_seq(asset_id)).order_by(
            desc(AssetVersion.major),
            desc(AssetVersion.minor),
            desc(AssetVersion.patch)))
        return process_join_results(session, results)


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_asset(r: AssetCreateRequest,
                       profile: Profile = Depends(current_profile)
                       ) -> AssetCreateResult:
    """Create a new asset for storing revisions or other assets"""
    with get_session() as session:
        org_seq = None

        # If the user passes a collection ID ensure that it exists
        if r.org_id is not None:
            org_seq = org_id_to_seq(r.org_id)
            col_result = session.exec(select(Org).where(
                Org.org_seq == org_seq)).one_or_none()
            if col_result is None:
                raise HTTPException(HTTPStatus.NOT_FOUND, f"org {r.org_id} not found")

        asset_result = session.exec(insert(Asset).values(
            org_seq=org_seq, owner_seq=profile.profile_seq))
        asset_seq = asset_result.inserted_primary_key[0]
        session.commit()
        return AssetCreateResult(
            asset_id=asset_seq_to_id(asset_seq),
            org_id=r.org_id,
            owner_id=profile_seq_to_id(profile.profile_id))


@router.post('/{asset_id}/versions/{version_str}')
async def create_asset_version(asset_id: str,
                               version_str: str,
                               r: AssetCreateVersionRequest,
                               response: Response,
                               profile: Profile = Depends(current_profile)) \
        -> AssetVersionResult:
    """Create or update a single asset version"""
    version_id = convert_version_input(version_str)
    if version_id == ZERO_VERSION:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail="versions with all zeros are not allowed")

    with get_session(echo=True) as session:
        # Find an existing asset version
        avr = select_asset_version(session, asset_id, version_id)
        if avr is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset {asset_id} not found")

        values = r.model_dump(exclude_unset=True)

        # resolve and process contents if they are set in the request they
        # for any files they will be resolved to real files (or a file not found error will occur)
        # and converted to json for serialization into storage
        contents = values.get('contents')
        if contents is not None:
            values['contents'] = resolve_contents_as_json(session, r.contents)

        # if the org_id is specified issue an update against the root asset
        org_id = values.get('org_id')
        if org_id is not None:
            org_seq = org_id_to_seq(org_id)
            asset_seq = asset_id_to_seq(asset_id)
            update_result = session.exec(update(Asset).values(
                org_seq=org_seq).where(
                Asset.asset_seq == asset_seq).where(
                Asset.owner_seq == profile.profile_seq))
            if update_result.rowcount != 1:
                raise HTTPException(HTTPStatus.FORBIDDEN, detail="org_id be updated by the asset owner")
            values.pop('org_id')

        # Use provided author or default to calling profile on creation
        if r.author_id:
            values['author_seq'] = profile_id_to_seq(r.author_id)
        else:
            values['author_seq'] = profile_seq_to_id(profile.profile_seq)

        # Create the revision, fails if the revision already exists
        # this could be optimized more using upsert but this will likely hold
        # up well enough
        try:
            if avr.version == ZERO_VERSION:
                stmt = insert(AssetVersion).values(
                    asset_seq=asset_id_to_seq(avr.asset_id),
                    major=version_id[0],
                    minor=version_id[1],
                    patch=version_id[2],
                    **values)
                result = session.execute(stmt)
                if result.rowcount != 1:
                    raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                                        detail="insert failed")
                session.commit()
                response.status_code = status.HTTP_201_CREATED
                log.info("asset version created %s, version %s",
                         asset_id,
                         version_id)
            else:
                stmt = update(AssetVersion).values(
                    **values).where(
                    AssetVersion.asset_seq == asset_id_to_seq(avr.asset_id)).where(
                    AssetVersion.major == version_id[0]).where(
                    AssetVersion.minor == version_id[1]).where(
                    AssetVersion.patch == version_id[2])
                result = session.exec(stmt)
                if result.rowcount != 1:
                    raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                                        detail="update failed")
                session.commit()
                log.info("asset version updated %s, version %s",
                         asset_id,
                         version_id)

            session.commit()

            # read back the join result, add and commit the event back
            read_back = select_asset_version(session, asset_id, version_id)
            add_version_packaging_event(session, read_back)
            session.commit()

            return read_back
        except sqlalchemy.exc.IntegrityError as exc:
            log.exception("asset database operation failed")
            raise HTTPException(HTTPStatus.CONFLICT,
                                detail=f'asset: {asset_id} version {version_id} already exists') from exc


@router.delete('/{asset_id}/versions/{version_str}')
async def delete_asset_version(asset_id: str, version_str: str, profile: Profile = Depends(current_profile)):
    """Delete a specific asset version"""
    version_id = convert_version_input(version_str)
    asset_seq = asset_id_to_seq(asset_id)
    with get_session(echo=True) as session:
        stmt = delete(AssetVersion).where(
            AssetVersion.asset_seq == asset_seq,
            AssetVersion.major == version_id[0],
            AssetVersion.minor == version_id[1],
            AssetVersion.patch == version_id[2], or_(
                AssetVersion.author_seq == profile.profile_seq,
                Asset.owner_seq == profile.profile_seq))
        result = session.exec(stmt)
        if result.rowcount != 1:
            raise HTTPException(HTTPStatus.FORBIDDEN,
                                detail="asset version be deleted by the asset owner")
        session.commit()


@router.get('/{asset_id}/versions/{version_str}')
async def get_asset_version_by_id(
        asset_id: str,
        version_str: str) -> AssetVersionResult:
    """Get the asset version for a given asset and version"""
    version_id = convert_version_input(version_str)
    with get_session() as session:
        version = select_asset_version(session, asset_id, version_id)
        if version is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{asset_id}', version {version_id} not found")
        return version
