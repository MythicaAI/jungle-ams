import json
import logging
from datetime import datetime
from enum import Enum
from http import HTTPStatus
from typing import Dict, Optional
from urllib.parse import urlparse

import sqlalchemy
from fastapi import HTTPException
from pydantic import BaseModel, StrictInt
from sqlmodel import Session, col, delete, desc, insert, or_, select, update

from content.locate_content import locate_content_by_seq
from cryptid.cryptid import asset_id_to_seq, asset_seq_to_id, file_id_to_seq, file_seq_to_id, org_id_to_seq, \
    org_seq_to_id, \
    profile_id_to_seq, profile_seq_to_id
from cryptid.location import location
from db.schema.assets import Asset, AssetTag, AssetVersion
from db.schema.events import Event
from db.schema.media import FileContent
from db.schema.profiles import Org, Profile
from db.schema.tags import Tag

ZERO_VERSION = [0, 0, 0]
VERSION_LEN = 3

FILE_TYPE_CATEGORIES = {'files', 'thumbnails'}
LINK_TYPE_CATEGORIES = {'links'}

asset_join_select = (
    select(Asset, AssetVersion)
    .outerjoin(AssetVersion, AssetVersion.asset_seq == Asset.asset_seq)
)

VersionTuple = tuple[StrictInt, StrictInt, StrictInt]

log = logging.getLogger(__name__)


class AssetCreateRequest(BaseModel):
    """Request to generate a parent asset record"""
    org_id: Optional[str] = None


class CreateOrUpdate(Enum):
    """Result for upsert operations"""
    CREATE = "create"
    UPDATE = "update"


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
    contents: Optional[dict[str, list[AssetVersionContent | str]]] = None


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
    version: list[int] = ZERO_VERSION
    commit_ref: Optional[str] = None
    created: datetime | None = None
    contents: Dict[str, list[AssetVersionContent | str]] = {}
    tags: Optional[list[str]] = {}


class AssetTopResult(AssetVersionResult):
    """Result object for a specific asset version or the asset head object
    when no version has been created. In this case the """
    downloads: int = 0  # Sum of all downloads
    versions: list[list[int]] = []  # Previously available versions


def resolve_tags(session: Session, asset_seq: int) -> list[(int, str)]:
    """Resolve all the tags for an asset"""
    tag_results = session.exec(
        select(AssetTag, Tag)
        .where(AssetTag.type_seq == asset_seq)
        .outerjoin(Tag, AssetTag.tag_seq == Tag.tag_seq)).all()
    converted = [r[1].name for r in tag_results]
    return converted


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
    if org_seq:
        org = session.exec(select(Org).where(Org.org_seq == org_seq)).one_or_none()
        if org:
            return org.name
    return ""


def process_join_results(session: Session, join_results: list[tuple[Asset, AssetVersion, AssetTag, Tag]]) -> list[
    AssetVersionResult]:
    """Process the join result of Asset, AssetVersion and FileContent tables"""

    results = list()
    for join_result in join_results:
        asset, ver = join_result
        if ver is None:
            # outer join or joined load didn't find a version
            ver = AssetVersion(major=0, minor=0, patch=0, created=None, contents={})
        asset_id = asset_seq_to_id(asset.asset_seq)
        avr = AssetVersionResult(
            asset_id=asset_id,
            org_id=org_seq_to_id(asset.org_seq) if asset.org_seq else None,
            org_name=resolve_org_name(session, asset.org_seq),
            owner_id=profile_seq_to_id(asset.owner_seq),
            owner_name=resolve_profile_name(session, asset.owner_seq),
            package_id=file_seq_to_id(ver.package_seq) if ver.package_seq else None,
            author_id=profile_seq_to_id(ver.author_seq) if ver.author_seq else None,
            author_name=resolve_profile_name(session, ver.author_seq) if ver.author_seq else None,
            name=ver.name,
            description=ver.description,
            published=ver.published,
            version=(ver.major, ver.minor, ver.patch),
            commit_ref=ver.commit_ref,
            created=ver.created,
            contents=asset_contents_json_to_model(asset_id, ver.contents),
            tags=resolve_tags(session, asset.asset_seq),
        )
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
        asset_seq = asset_id_to_seq(asset_id)
        stmt = select(Asset, AssetVersion).outerjoin(
            AssetVersion,
            (Asset.asset_seq == AssetVersion.asset_seq) &
            (AssetVersion.major == version[0]) &
            (AssetVersion.minor == version[1]) &
            (AssetVersion.patch == version[2])
        ).where(
            Asset.asset_seq == asset_seq
        )
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
    loc = location()
    stmt = insert(Event).values(
        event_type="asset_version_updated",
        job_data=job_data,
        owner_seq=profile_id_to_seq(avr.owner_id),
        created_in=loc,
        affinity=loc)
    event_result = session.exec(stmt)
    log.info("packaging event for %s by %s -> %s",
             avr.asset_id, avr.owner_id, event_result)
    return event_result


def asset_contents_json_to_model(asset_id: str, contents: dict[str, list[str]]) \
        -> dict[str, list[AssetVersionContent | str]]:
    """Convert JSON assert version contents to model objects"""
    converted = {}
    if type(contents) is not dict:
        log.warning("asset: %s content is not a dictionary", asset_id)
        return converted
    for category, content_list in contents.items():
        if category in FILE_TYPE_CATEGORIES:
            converted[category] = list(map(lambda s: AssetVersionContent(**json.loads(s)), content_list))
        elif category in LINK_TYPE_CATEGORIES:
            converted[category] = content_list
        else:
            log.warning("asset: %s contains unknown content category %s", asset_id, category)
    return converted


def resolve_content_list(
        session: Session,
        category: str,
        in_content_list: list[AssetVersionContent | str]):
    resolved_content_list = []
    if category in FILE_TYPE_CATEGORIES:
        for asset_content in in_content_list:
            try:
                if type(asset_content) is str:
                    file_id = asset_content
                    file_name = None
                else:
                    file_id = asset_content.file_id
                    file_name = asset_content.file_name
                db_file = locate_content_by_seq(session, file_id_to_seq(file_id))
                content = AssetVersionContent(
                    file_id=file_seq_to_id(db_file.file_seq),
                    file_name=file_name or db_file.name,
                    content_hash=db_file.content_hash,
                    size=db_file.size)
                resolved_content_list.append(content.model_dump_json())
            except FileNotFoundError as exc:
                raise HTTPException(HTTPStatus.NOT_FOUND,
                                    detail=f"file '{asset_content.file_id}' not found") from exc
    elif category in LINK_TYPE_CATEGORIES:
        for link in in_content_list:
            parsed = urlparse(link)
            if not parsed.scheme or not parsed.netloc:
                raise HTTPException(
                    HTTPStatus.BAD_REQUEST,
                    detail=f"link '{link}' is not valid"
                )
            resolved_content_list.append(link)
    return resolved_content_list


def resolve_contents_as_json(
        session: Session,
        in_files_categories: dict[str, list[AssetVersionContent | str]]) \
        -> AssetContentDocument:
    """Convert any partial content references into fully resolved references"""
    contents = {}

    # resolve all file content types
    for category, content_list in in_files_categories.items():
        resolved_content_list = resolve_content_list(session, category, content_list)
        contents[category] = resolved_content_list

    return contents


def create_root(session: Session, r: AssetCreateRequest, profile_seq: int) -> AssetCreateResult:
    """
    Create the root asset that is the stable ID for all asset versions
    """
    org_seq = None

    # If the user passes a collection ID ensure that it exists
    if r.org_id is not None:
        org_seq = org_id_to_seq(r.org_id)
        col_result = session.exec(select(Org).where(
            Org.org_seq == org_seq)).one_or_none()
        if col_result is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"org {r.org_id} not found")

    asset_result = session.exec(insert(Asset).values(
        org_seq=org_seq, owner_seq=profile_seq))
    asset_seq = asset_result.inserted_primary_key[0]
    session.commit()
    return AssetCreateResult(
        asset_id=asset_seq_to_id(asset_seq),
        org_id=r.org_id,
        owner_id=profile_seq_to_id(profile_seq))


def create_version(session: Session,
                   asset_id: str,
                   version_str: str,
                   r: AssetCreateVersionRequest,
                   profile_seq: int) -> tuple[CreateOrUpdate, AssetVersionResult]:
    version_id = convert_version_input(version_str)
    if version_id == ZERO_VERSION:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail="versions with all zeros are not allowed")

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
    org_id = values.pop('org_id', None)
    if org_id:
        org_seq = org_id_to_seq(org_id)
        asset_seq = asset_id_to_seq(asset_id)
        update_result = session.exec(update(Asset).values(
            org_seq=org_seq).where(
            Asset.asset_seq == asset_seq).where(
            Asset.owner_seq == profile_seq))
        if update_result.rowcount != 1:
            raise HTTPException(HTTPStatus.FORBIDDEN, detail="org_id be updated by the asset owner")

    # Use provided author or default to calling profile on creation
    if r.author_id:
        values['author_seq'] = profile_id_to_seq(r.author_id)
        values.pop('author_id')
    else:
        values['author_seq'] = profile_seq

    create_or_update = CreateOrUpdate.CREATE

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
            result = session.exec(stmt)
            if result.rowcount != 1:
                raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                                    detail="insert failed")
            session.commit()
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
            create_or_update = CreateOrUpdate.UPDATE
        session.commit()

        # read back the join result, add and commit the event back
        read_back = select_asset_version(session, asset_id, version_id)
        add_version_packaging_event(session, read_back)
        session.commit()

        return create_or_update, read_back
    except sqlalchemy.exc.IntegrityError as exc:
        log.exception("asset database operation failed")
        raise HTTPException(HTTPStatus.CONFLICT,
                            detail=f'asset: {asset_id} version {version_id} already exists') from exc


def delete_version(session: Session, asset_id: str, version_str: str, profile_seq: int):
    version_id = convert_version_input(version_str)
    asset_seq = asset_id_to_seq(asset_id)

    stmt = delete(AssetVersion).where(
        AssetVersion.asset_seq == asset_seq,
        AssetVersion.major == version_id[0],
        AssetVersion.minor == version_id[1],
        AssetVersion.patch == version_id[2], or_(
            AssetVersion.author_seq == profile_seq,
            Asset.owner_seq == profile_seq))
    result = session.exec(stmt)
    if result.rowcount != 1:
        raise HTTPException(HTTPStatus.FORBIDDEN,
                            detail="asset version be deleted by the asset owner")
    session.commit()


def top(session: Session):
    results = session.exec(
        select(Asset, AssetVersion, FileContent)
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(FileContent, FileContent.file_seq == AssetVersion.package_seq)
        .where(AssetVersion.published == True)
        .where(AssetVersion.package_seq != None)
    ).all()

    def avf_to_top(asset, ver, downloads, sorted_versions):
        asset_id = asset_seq_to_id(asset.asset_seq)
        return AssetTopResult(
            asset_id=asset_id,
            org_id=org_seq_to_id(asset.org_seq) if asset.org_seq else None,
            org_name=resolve_org_name(session, asset.org_seq),
            owner_id=profile_seq_to_id(asset.owner_seq),
            owner_name=resolve_profile_name(session, asset.owner_seq),
            package_id=file_seq_to_id(ver.package_seq),
            author_id=profile_seq_to_id(ver.author_seq),
            author_name=resolve_profile_name(session, ver.author_seq),
            name=ver.name,
            description=ver.description,
            published=ver.published,
            version=(ver.major, ver.minor, ver.patch),
            commit_ref=ver.commit_ref,
            created=ver.created,
            contents=asset_contents_json_to_model(asset_id, ver.contents),
            versions=sorted_versions,
            downloads=downloads,
            tags=resolve_tags(session, asset.asset_seq))

    reduced = {}
    for result in results:
        asset, ver, file = result
        if ver is None or file is None:
            continue
        atr = reduced.get(asset.asset_seq, None)
        version_id = [ver.major, ver.minor, ver.patch]
        if atr is None:
            reduced[asset.asset_seq] = avf_to_top(
                asset, ver, file.downloads, [])
        else:
            versions = atr.versions
            versions.append(version_id)
            atr.versions = sorted(atr.versions, reverse=True)[0:4]
            atr.downloads += file.downloads
            if version_id > atr.version:
                reduced[asset.asset_seq] = avf_to_top(
                    asset, ver, atr.downloads, atr.versions)

    sort_results = sorted(reduced.values(), key=lambda x: x.downloads, reverse=True)
    return sort_results


def owned_versions(session: Session, profile_seq: int) -> list[AssetVersionResult]:
    results = session.exec(
        select(Asset, AssetVersion)
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .where(Asset.owner_seq == profile_seq)
        .where(Asset.deleted == None)
        .order_by(Asset.asset_seq)).all()
    return process_join_results(session, results)


def versions_by_name(session: Session, asset_name: str) -> list[AssetVersionResult]:
    return process_join_results(session, session.exec(
        asset_join_select.where(
            Asset.asset_seq == AssetVersion.asset_seq,
            AssetVersion.name == asset_name)).all())


def version_by_asset_id(session: Session, asset_id: str) -> list[AssetVersionResult]:
    results = session.exec(select(Asset, AssetVersion).outerjoin(
        AssetVersion, Asset.asset_seq == AssetVersion.asset_seq).where(
        Asset.asset_seq == asset_id_to_seq(asset_id)).order_by(
        desc(AssetVersion.major),
        desc(AssetVersion.minor),
        desc(AssetVersion.patch)))
    return process_join_results(session, results)


def versions_by_commit_ref(session: Session, commit_ref: str) -> list[AssetVersionResult]:
    return process_join_results(session, session.exec(
        asset_join_select.where(Asset.asset_seq == AssetVersion.asset_seq).where(
            col(AssetVersion.commit_ref).contains(commit_ref))).all())  # pylint: disable=no-member
