# pylint: disable=unnecessary-lambda, no-member, unsupported-membership-test

import logging
from datetime import datetime
from enum import Enum
from http import HTTPStatus
from typing import Any, Dict, Iterable, Optional, Union

import sqlalchemy
from fastapi import HTTPException
from pydantic import AnyHttpUrl, BaseModel, Field, StrictInt, ValidationError
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import delete as sql_delete, insert, or_, select, update
from sqlmodel.ext.asyncio.session import AsyncSession

from assets import queries as asset_q
from content.locate_content import locate_content_by_seq
from content.resolve_download_info import resolve_download_info
from content.validate_filename import validate_filename
from cryptid.cryptid import asset_id_to_seq, asset_seq_to_id, file_id_to_seq, file_seq_to_id, org_id_to_seq, \
    org_seq_to_id, profile_id_to_seq, profile_seq_to_id
from cryptid.location import location
from db.schema.assets import Asset, AssetVersion, AssetVersionEntryPoint
from db.schema.events import Event
from db.schema.profiles import Org, Profile
from ripple.auth import roles
from ripple.auth.authorization import Scope, validate_roles
from ripple.models.assets import AssetVersionRef
from ripple.models.sessions import SessionProfile
from routes.download.download import DownloadInfoResponse
from storage.storage_client import StorageClient
from tags.tag_models import TagResponse, TagType
from tags.type_utils import resolve_type_tags

ZERO_VERSION = [0, 0, 0]
VERSION_LEN = 3

FILES_CONTENT_KEY = 'files'
THUMBNAILS_CONTENT_KEY = 'thumbnails'
LINKS_CONTENT_KEY = 'links'
DEPENDENCIES_CONTENT_KEY = 'dependencies'

FILE_TYPE_CATEGORIES = {FILES_CONTENT_KEY, THUMBNAILS_CONTENT_KEY}
ASSET_VERSION_TYPE_CATEGORIES = {DEPENDENCIES_CONTENT_KEY}
LINK_TYPE_CATEGORIES = {LINKS_CONTENT_KEY}

asset_join_select = (
    select(Asset, AssetVersion)
    .outerjoin(AssetVersion, AssetVersion.asset_seq == Asset.asset_seq)
    .where(Asset.deleted == None, AssetVersion.deleted == None)
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


class AssetFileReference(BaseModel):
    """Embedded file reference in an asset version content.

    When creating a new asset version only the file_id and the relative path (name) are required.

    When the file is resolved during the creation of the version it will receive the content
    hash and size from the underlying file_id"""
    file_id: str
    file_name: str
    content_hash: Optional[str] = None
    size: Optional[int] = None
    src_file_id: Optional[str] = None


class AssetDependency(BaseModel):
    """Embedded asset version reference (dependency) in asset version content

    When creating a new asset version the asset_id, major, minor, patch are required to
    specify the dependency of the package.

    When the dependency is resolved the package_id, content_hash, file_id, name and size
    will be resolved"""
    asset_id: str
    version: list[int]
    package_id: Optional[str] = None
    file_name: Optional[str] = None
    content_hash: Optional[str] = None
    size: Optional[int] = None


# Shorthand for a shallow document that contains pre-serialized JSON
AssetContentDocument = dict[str, list[str]]


class AssetCreateVersionRequest(BaseModel):
    """Create a new version of an asset with its contents"""
    org_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    blurb: Optional[str] = None
    published: Optional[bool] = False
    commit_ref: Optional[str] = None
    contents: Optional[dict[str, list[AssetFileReference | AssetDependency | str]]] = None


class AssetUpdateVersionContentsRequest(AssetFileReference):
    """Update the contents of an asset version"""
    file_type: str


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
    blurb: str | None = None
    published: bool | None = False
    version: list[int] = Field(default_factory=lambda: ZERO_VERSION.copy())
    commit_ref: Optional[str] = None
    created: datetime | None = None
    contents: Dict[str, list[AssetFileReference | AssetDependency | str]] = Field(default_factory=dict)
    tags: Optional[list[TagResponse]] = Field(default_factory=list)


class AssetTopResult(AssetVersionResult):
    """Result object for a specific asset version or the asset head object
    when no version has been created. In this case the """
    downloads: int = 0  # Sum of all downloads
    versions: list[list[int]] = Field(default_factory=list)  # Previously available versions


class MissingDependencyResult(BaseModel):
    """A missing dependency either version or package"""
    missing_version: Optional[tuple[str, tuple[int, ...]]] = None
    missing_package_link: bool = False
    missing_package: Optional[str] = None


class AssetDependencyResult(BaseModel):
    """Query result from /dependencies"""
    dependencies: list[AssetVersionResult] = Field(default_factory=list)
    missing: list[MissingDependencyResult] = Field(default_factory=list)
    packages: list[DownloadInfoResponse] = Field(default_factory=list)


class DependencyQueryContext(BaseModel):
    """Context used for querying package dependencies """
    results: list[AssetVersionResult] = Field(default_factory=list)
    visit: list[tuple[str, tuple[int, ...]]] = Field(default_factory=list)
    visited: set[tuple[str, tuple[int, ...]]] = Field(default_factory=set)
    missing: list[MissingDependencyResult] = Field(default_factory=list)
    packages: list[DownloadInfoResponse] = Field(default_factory=list)


async def resolve_profile_name(db_session: AsyncSession, profile_seq: int) -> str:
    """Convert profile_id to profile name"""
    profile = (await db_session.exec(select(Profile)
                                     .where(Profile.profile_seq == profile_seq))).one_or_none()
    if profile:
        return profile.name
    return ""


async def resolve_org_name(db_session: AsyncSession, org_seq: int) -> str:
    """Convert org_id to org name"""
    if org_seq:
        org = (await db_session.exec(select(Org).where(Org.org_seq == org_seq))).one_or_none()
        if org:
            return org.name
    return ""


async def old_process_join_results(
        db_session: AsyncSession,
        join_results: Iterable[tuple[Asset, AssetVersion]]) \
        -> list[AssetVersionResult]:
    """Process the join result of Asset, AssetVersion and FileContent tables"""

    results = list()
    for join_result in join_results:
        asset = join_result[0]
        ver = join_result[1]
        if ver is None:
            # outer join or joined load didn't find a version
            ver = AssetVersion(major=0, minor=0, patch=0, created=None, contents={})
        asset_id = asset_seq_to_id(asset.asset_seq)
        avr = AssetVersionResult(
            asset_id=asset_id,
            org_id=org_seq_to_id(asset.org_seq) if asset.org_seq else None,
            org_name=await resolve_org_name(db_session, asset.org_seq),
            owner_id=profile_seq_to_id(asset.owner_seq),
            owner_name=await resolve_profile_name(db_session, asset.owner_seq),
            package_id=file_seq_to_id(ver.package_seq) if ver.package_seq else None,
            author_id=profile_seq_to_id(ver.author_seq) if ver.author_seq else None,
            author_name=await resolve_profile_name(db_session, ver.author_seq) if ver.author_seq else None,
            name=ver.name,
            description=ver.description,
            blurb=ver.blurb,
            published=ver.published,
            version=[ver.major, ver.minor, ver.patch],
            commit_ref=ver.commit_ref,
            created=ver.created,
            contents=asset_contents_json_to_model(asset_id, ver.contents),
            tags=await resolve_type_tags(db_session, TagType.asset, asset.asset_seq),
        )
        results.append(avr)
    return results


async def process_join_results(
        join_results: Iterable[tuple[Asset, AssetVersion, dict[str, Union[int, str]]]] \
) -> list[AssetVersionResult]:
    """Process the join result of Asset, AssetVersion and FileContent tables"""
    
    results = list()
    for asset, ver, tag_to_asset, owner_name, author_name, org_name  in join_results:
        if ver is None:
            # outer join or joined load didn't find a version
            ver = AssetVersion(major=0, minor=0, patch=0, created=None, contents={})
        asset_id = asset_seq_to_id(asset.asset_seq)
        avr = AssetVersionResult(
            asset_id=asset_id,
            org_id=org_seq_to_id(asset.org_seq) if asset.org_seq else None,
            org_name=org_name if org_name else "",
            owner_id=profile_seq_to_id(asset.owner_seq),
            owner_name=owner_name or "",
            package_id=file_seq_to_id(ver.package_seq) if ver.package_seq else None,
            author_id=profile_seq_to_id(ver.author_seq) if ver.author_seq else None,
            author_name=author_name or "",
            name=ver.name,
            description=ver.description,
            blurb=ver.blurb,
            published=ver.published,
            version=[ver.major, ver.minor, ver.patch],
            commit_ref=ver.commit_ref,
            created=ver.created,
            contents=asset_contents_json_to_model(asset_id, ver.contents),
            tags=asset_q.resolve_assets_tag(tag_to_asset),
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


async def select_asset_version(db_session: AsyncSession,
                               asset_id: str,
                               version: tuple[int, ...]) -> Iterable[tuple[Asset, AssetVersion]] | None:
    """Execute a select against the asset versions table"""
    if version == ZERO_VERSION:
        asset = (await db_session.exec(select(Asset).where(
            Asset.asset_seq == asset_id_to_seq(asset_id))
                                       .where(Asset.deleted == None))).first()
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
        results = await asset_q.exec_query_select_asset_version(db_session, asset_seq, version)
    if not results:
        return None
    return results


async def select_asset_dependencies(
        db_session: AsyncSession,
        asset_id: str,
        version_str: str,
        storage: StorageClient) -> AssetDependencyResult:
    """Recursively query dependencies for a specific asset version"""
    version_id = convert_version_input(version_str)
    ctx = DependencyQueryContext()
    ctx.visit.append((asset_id, tuple(version_id)))

    while ctx.visit:
        # Look for the first asset version in the list, resolve the asset, and it's package
        # download information
        asset_id, version_id = ctx.visit.pop()
        avr_results = await select_asset_version(db_session, asset_id, version_id)
        avr = (await process_join_results(avr_results))[0] if avr_results else None
        if avr is None or avr.published is False:
            ctx.missing.append(
                MissingDependencyResult(
                    missing_version=(asset_id, tuple(version_id))))
        elif avr.package_id is None:
            ctx.missing.append(
                MissingDependencyResult(
                    missing_version=(asset_id, tuple(version_id)),
                    missing_package_link=True))
        else:
            download_info = await resolve_download_info(db_session, avr.package_id, storage)
            if download_info is None:
                ctx.missing.append(
                    MissingDependencyResult(missing_package=avr.package_id))
            else:
                ctx.results.append(avr)
                ctx.packages.append(download_info)

        dependencies = avr.contents.get(DEPENDENCIES_CONTENT_KEY, {})
        if not dependencies:
            continue
        for asset_dep in dependencies:
            key = (asset_dep.asset_id, tuple(asset_dep.version))
            if key in ctx.visited:
                continue
            ctx.visited.add(key)
            ctx.visit.append(key)

    return AssetDependencyResult(
        dependencies=ctx.results,
        missing=ctx.missing,
        packages=ctx.packages)


async def add_version_packaging_event(db_session: AsyncSession, avr: AssetVersionResult):
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
    event_result = await db_session.exec(stmt)
    log.info("packaging event for %s by %s -> %s",
             avr.asset_id, avr.owner_id, event_result)
    return event_result


def asset_contents_json_to_model(asset_id: str, contents: dict[str, list[dict]]) \
        -> dict[str, list[AssetFileReference | AssetDependency | str]]:
    """Convert JSON assert version contents to model objects"""
    converted = {}
    if type(contents) is not dict:
        log.warning("asset: %s content is not a dictionary", asset_id)
        return converted
    for category, content_list in contents.items():
        if category in FILE_TYPE_CATEGORIES:
            converted[category] = list(map(lambda s: AssetFileReference(**s), content_list))
        elif category in ASSET_VERSION_TYPE_CATEGORIES:
            converted[category] = list(map(lambda s: AssetDependency(**s), content_list))
        elif category in LINK_TYPE_CATEGORIES:
            converted[category] = content_list
        else:
            log.warning("asset: %s contains unknown content category %s", asset_id, category)
    return converted


async def resolve_content_list(
        db_session: AsyncSession,
        category: str,
        content: list[Union[str, Dict[str, Any]]]):
    """For each category return the fully resolved version of list of items in the category"""
    if category in FILE_TYPE_CATEGORIES:
        return [await resolve_asset_file_reference(db_session, x) for x in content]
    elif category in ASSET_VERSION_TYPE_CATEGORIES:
        return [await resolve_asset_dependency(db_session, x) for x in content]
    elif category in LINK_TYPE_CATEGORIES:
        return [resolve_asset_link(x) for x in content]


async def resolve_asset_file_reference(
        db_session: AsyncSession,
        file_reference: Union[str, AssetFileReference]) -> dict:
    file_id = file_reference.file_id
    file_name = file_reference.file_name
    validate_filename(file_name)
    if file_id is None or file_name is None:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            f"file_id and file_name required on {str(file_reference)}")
    db_file = await locate_content_by_seq(db_session, file_id_to_seq(file_id))
    files_to_check = [(db_file, file_id)]

    if file_reference.src_file_id:
        src_file = await locate_content_by_seq(db_session, file_id_to_seq(file_reference.src_file_id))
        files_to_check.append((src_file, file_reference.src_file_id))

    for file, file_id in files_to_check:
        if file is None:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                detail=f"file '{file_id}' not found")

    return AssetFileReference(
        file_id=file_seq_to_id(db_file.file_seq),
        file_name=file_name or db_file.name,
        content_hash=db_file.content_hash,
        size=db_file.size,
        src_file_id=file_reference.src_file_id,
    ).model_dump()


async def resolve_asset_dependency(
        db_session: AsyncSession,
        dep: AssetDependency) -> dict:
    asset_id = dep.asset_id
    version = dep.version
    if asset_id is None or version is None or len(version) != 3:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            f'asset_id and version required on {str(dep)}')
    avr_results = await select_asset_version(db_session, asset_id, tuple(version))
    avr = (await process_join_results(avr_results))[0] if avr_results else None
    if avr is None:
        raise HTTPException(HTTPStatus.NOT_FOUND,
                            f'asset {asset_id} {version} not found')
    package_file = await locate_content_by_seq(db_session, file_id_to_seq(avr.package_id))
    return AssetDependency(
        asset_id=avr.asset_id,
        version=avr.version,
        package_id=avr.package_id,
        file_name=package_file.name,
        content_hash=package_file.content_hash,
        size=package_file.size).model_dump()


def resolve_asset_link(link):
    """Ensure the link is parsable"""
    try:
        return str(AnyHttpUrl(link))
    except ValidationError as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail=f"link '{link}' not valid") from e


async def resolve_contents_as_json(
        db_session: AsyncSession,
        in_files_categories: dict[str, list[AssetFileReference | str]]) \
        -> Dict[str, Any]:
    """Convert any partial content references into fully resolved references"""
    contents = {}

    # resolve all file content types
    for category, content_list in in_files_categories.items():
        contents[category] = await resolve_content_list(db_session, category, content_list)

    return contents


async def create_root(
        db_session: AsyncSession,
        r: AssetCreateRequest,
        owner_seq: int) -> AssetCreateResult:
    """
    Create the root asset that is the stable ID for all asset versions
    """
    org_seq = None

    # If the user passes an organization ID ensure that it exists
    if r.org_id is not None:
        org_seq = org_id_to_seq(r.org_id)
        col_result = (await db_session.exec(select(Org).where(
            Org.org_seq == org_seq))).one_or_none()
        if col_result is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"org {r.org_id} not found")

    asset_result = await db_session.exec(insert(Asset).values(
        org_seq=org_seq, owner_seq=owner_seq))
    asset_seq = asset_result.inserted_primary_key[0]
    await db_session.commit()
    return AssetCreateResult(
        asset_id=asset_seq_to_id(asset_seq),
        org_id=r.org_id,
        owner_id=profile_seq_to_id(owner_seq))


async def update_versions_contents(
    asset_id: str,
    version_str: str,
    req: AssetUpdateVersionContentsRequest,
    profile: SessionProfile,
    db_session: AsyncSession,
) -> AssetVersionResult:
    """
    Updates the contents of a specific version of an asset.
    Returns:
        AssetVersionResult: The result of the asset version update.
    Raises:
        HTTPException: If the version ID is invalid, the asset is not found, or the update fails.
    """
    version_id = convert_version_input(version_str)
    if list(version_id) == ZERO_VERSION:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, detail="versions with all zeros are not allowed"
        )
    # Find an existing asset version
    avr_results = await select_asset_version(db_session, asset_id, version_id)
    avr = (
        (await process_join_results(avr_results))[0]
        if avr_results
        else None
    )
    if avr is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset {asset_id} not found")

    asset_instance, *_ = avr_results[0]
    scope = Scope(
        profile=profile,
        asset_version=AssetVersionRef.create(
            asset_seq=asset_instance.asset_seq,
            owner_seq=asset_instance.owner_seq,
            org_seq=asset_instance.org_seq,
        ),
    )
    validate_dict = dict(
        role=roles.asset_update,
        object_id=asset_id,
        auth_roles=profile.auth_roles,
        scope=scope,
    )
    validate_roles(**validate_dict)

    new_content_item = await resolve_content_list(
        db_session, req.file_type, [AssetFileReference(**req.model_dump())]
    )
    new_content = avr.contents.copy()
    if new_content.get(req.file_type):
        new_content[req.file_type].extend(new_content_item)
    else:
        new_content[req.file_type] = new_content_item

    # Convert pydantic models to a suitable sql field content if needed
    for category in new_content.copy().keys():
        item_dicts = []
        for item in new_content[category]:
            if not isinstance(item, dict) and not isinstance(item, str):
                item_dicts.append(item.model_dump())
            else:
                item_dicts.append(item)
        new_content[category] = item_dicts

    stmt = (
        update(AssetVersion)
        .values({AssetVersion.contents: new_content})
        .where(AssetVersion.asset_seq == asset_id_to_seq(avr.asset_id))
        .where(AssetVersion.major == version_id[0])
        .where(AssetVersion.minor == version_id[1])
        .where(AssetVersion.patch == version_id[2])
        .where(AssetVersion.deleted == None)
    )
    result = await db_session.exec(stmt)
    if result.rowcount != 1:
        raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, detail="update failed")

    await db_session.commit()
    log.info("asset version updated %s, version %s", asset_id, version_id)
    await db_session.commit()

    avr_results = await select_asset_version(db_session, asset_id, version_id)
    read_back = (
        (await process_join_results(avr_results))[0]
        if avr_results
        else None
    )
    if req.file_type in {FILES_CONTENT_KEY, DEPENDENCIES_CONTENT_KEY}:
        await add_version_packaging_event(db_session, read_back)
        await db_session.commit()

    return read_back


async def create_version(db_session: AsyncSession,
                         asset_id: str,
                         version_str: str,
                         r: AssetCreateVersionRequest,
                         profile: SessionProfile,
                         owner_seq: int,
                         author_seq: int) -> tuple[CreateOrUpdate, AssetVersionResult]:
    version_id = convert_version_input(version_str)
    if list(version_id) == ZERO_VERSION:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail="versions with all zeros are not allowed")

    # Find an existing asset version
    avr_results = await select_asset_version(db_session, asset_id, version_id)
    avr = (await process_join_results(avr_results))[0] if avr_results else None
    if avr is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset {asset_id} not found")

    asset_instance, *_ = avr_results[0]
    scope = Scope(profile=profile,
                  asset_version=AssetVersionRef.create(
                      asset_seq=asset_instance.asset_seq,
                      owner_seq=asset_instance.owner_seq,
                      org_seq=asset_instance.org_seq))
    # version is ZERO if there is only a root asset
    if avr.version == ZERO_VERSION:
        create_or_update = CreateOrUpdate.CREATE
        validate_dict = dict(
            role=roles.asset_create,
            object_id=asset_id,
            auth_roles=profile.auth_roles,
            scope=scope)
    else:
        create_or_update = CreateOrUpdate.UPDATE
        validate_dict = dict(
            role=roles.asset_update,
            object_id=asset_id,
            auth_roles=profile.auth_roles,
            scope=scope)

    # Validate the asset operation against the issuing profile
    validate_roles(**validate_dict)

    # Extract all values from the request
    values = r.model_dump(exclude_unset=True)

    # resolve and process contents if they are set in the request they
    # for any files they will be resolved to real files (or a file not found error will occur)
    # and converted to json for serialization into storage
    contents = values.get('contents')
    if contents is not None:
        values['contents'] = await resolve_contents_as_json(db_session, r.contents)

    # org change: if the org_id is specified update the property of the root asset
    org_id = values.pop('org_id', None)
    if org_id:
        org_seq = org_id_to_seq(org_id)
        asset_seq = asset_id_to_seq(asset_id)
        update_result = await db_session.exec(update(Asset).values(
            org_seq=org_seq)
        .where(Asset.deleted == None).where(
            Asset.asset_seq == asset_seq).where(
            Asset.owner_seq == owner_seq))
        if update_result.rowcount != 1:
            raise HTTPException(HTTPStatus.FORBIDDEN, detail="org_id be updated by the asset owner")

    # Track author for update auditing
    values['author_seq'] = author_seq

    # Create the revision, fails if the revision already exists
    # this could be optimized more using upsert but this will likely hold
    # up well enough
    try:
        if create_or_update == CreateOrUpdate.CREATE:
            stmt = insert(AssetVersion).values(
                asset_seq=asset_id_to_seq(avr.asset_id),
                major=version_id[0],
                minor=version_id[1],
                patch=version_id[2],
                **values)
            result = await db_session.exec(stmt)
            if result.rowcount != 1:
                raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                                    detail="insert failed")
            await db_session.commit()
            log.info("asset version created %s, version %s",
                     asset_id,
                     version_id)
        else:
            stmt = update(AssetVersion).values(
                **values).where(
                AssetVersion.asset_seq == asset_id_to_seq(avr.asset_id)).where(
                AssetVersion.major == version_id[0]).where(
                AssetVersion.minor == version_id[1]).where(
                AssetVersion.patch == version_id[2]).where(
                AssetVersion.deleted == None)
            result = await db_session.exec(stmt)
            if result.rowcount != 1:
                raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                                    detail="update failed")
            stmt = sql_delete(AssetVersionEntryPoint).where(
                AssetVersionEntryPoint.asset_seq == asset_id_to_seq(avr.asset_id)).where(
                AssetVersionEntryPoint.major == version_id[0]).where(
                AssetVersionEntryPoint.minor == version_id[1]).where(
                AssetVersionEntryPoint.patch == version_id[2])
            result = await db_session.exec(stmt)
            if result.rowcount > 0:
                log.info("Cleared %s entry points for %s, version %s", result.rowcount, asset_id, version_id)
            await db_session.commit()
            log.info("asset version updated %s, version %s",
                     asset_id,
                     version_id)
        await db_session.commit()

        # read back the join result, add and commit the event back
        avr_results = await select_asset_version(db_session, asset_id, version_id)
        read_back = (await process_join_results(avr_results))[0] if avr_results else None
        await add_version_packaging_event(db_session, read_back)
        await db_session.commit()

        return create_or_update, read_back
    except sqlalchemy.exc.IntegrityError as exc:
        log.exception("asset database operation failed")
        raise HTTPException(HTTPStatus.CONFLICT,
                            detail=f'asset: {asset_id} version {version_id} already exists') from exc


async def delete_version(db_session: AsyncSession, asset_id: str, version_str: str, profile_seq: int):
    version_id = convert_version_input(version_str)
    asset_seq = asset_id_to_seq(asset_id)

    stmt = (
        update(AssetVersion)
        .values(deleted=sql_now())
        .where(
            AssetVersion.asset_seq == asset_seq,
            AssetVersion.major == version_id[0],
            AssetVersion.minor == version_id[1],
            AssetVersion.patch == version_id[2],
            AssetVersion.deleted == None,
            or_(
                AssetVersion.author_seq == profile_seq,
                AssetVersion.asset_seq == Asset.asset_seq,
                Asset.owner_seq == profile_seq,
            )
        )
    )
    result = await db_session.exec(stmt)
    if result.rowcount != 1:
        raise HTTPException(HTTPStatus.FORBIDDEN,
                            detail="asset version be deleted by the asset owner")
    await db_session.commit()


async def delete_asset_and_versions(db_session: AsyncSession, asset_id: str, profile: SessionProfile):
    asset_seq = asset_id_to_seq(asset_id)

    try:
        asset = (await db_session.exec(
            select(Asset)
            .where(
                Asset.asset_seq == asset_seq,
            )
            .where(Asset.deleted == None)
        )).one()
    except NoResultFound as ex:
        log.error("Delete an asset error: %s", str(ex))
        raise HTTPException(
            HTTPStatus.NOT_FOUND, detail=f"asset {asset_id} not found"
        ) from ex

    scope = Scope(profile=profile,
                  asset_version=AssetVersionRef.create(
                      asset_seq=asset_seq,
                      owner_seq=asset.owner_seq,
                      author_seq=asset.owner_seq,
                      org_seq=asset.org_seq, ))

    validate_roles(
        role=roles.asset_delete,
        object_id=asset_id,
        auth_roles=profile.auth_roles,
        scope=scope)

    stmt = (
        update(Asset)
        .values(deleted=sql_now())
        .where(Asset.deleted == None)
        .where(Asset.asset_seq == asset_seq)
    )
    await db_session.exec(stmt)

    stmt = (
        update(AssetVersion)
        .values(deleted=sql_now())
        .where(AssetVersion.deleted == None)
        .where(AssetVersion.asset_seq == asset_seq)
    )
    await db_session.exec(stmt)
    await db_session.commit()


async def top(db_session: AsyncSession) -> list[AssetTopResult]:
    results = await asset_q.get_top_published_assets_metadata_query(db_session)

    def avf_to_top(
            asset: Asset,
            ver: AssetVersion,
            downloads: int,
            sorted_versions: list[list[int]],
            tag_to_asset: list[dict[str, Union[int, str]]],
            owner_name: str, author_name: str, org_name: str
    ):
        asset_id = asset_seq_to_id(asset.asset_seq)
        return AssetTopResult(
            asset_id=asset_id,
            org_id=org_seq_to_id(asset.org_seq) if asset.org_seq else None,
            org_name=org_name if org_name else "",
            owner_id=profile_seq_to_id(asset.owner_seq),
            owner_name=owner_name or "",
            package_id=file_seq_to_id(ver.package_seq),
            author_id=profile_seq_to_id(ver.author_seq),
            author_name=author_name or "",
            name=ver.name,
            description=ver.description,
            blurb=ver.blurb,
            published=ver.published,
            version=(ver.major, ver.minor, ver.patch),
            commit_ref=ver.commit_ref,
            created=ver.created,
            contents=asset_contents_json_to_model(asset_id, ver.contents),
            versions=sorted_versions,
            downloads=downloads,
            tags=asset_q.resolve_assets_tag(tag_to_asset),
        )

    reduced: dict[int, AssetTopResult] = {}
    for result in results:
        asset, ver, file, tag_to_asset, owner_name, author_name, org_name = result
        if ver is None or file is None:
            continue
        atr: Optional[AssetTopResult] = reduced.get(asset.asset_seq, None)
        version_id = [ver.major, ver.minor, ver.patch]
        if atr is None:
            reduced[asset.asset_seq] = avf_to_top(
                asset, ver, file.downloads, [], tag_to_asset, owner_name, author_name, org_name)
        else:
            versions = atr.versions
            versions.append(version_id)
            atr.versions = sorted(atr.versions, reverse=True)[0:4]
            atr.downloads += file.downloads
            if version_id > atr.version:
                reduced[asset.asset_seq] = avf_to_top(
                    asset, ver, atr.downloads, atr.versions, tag_to_asset, owner_name, author_name, org_name)

    sort_results = sorted(reduced.values(), key=lambda x: x.downloads, reverse=True)
    return sort_results


async def latest_version(db_session: AsyncSession, asset_seq: int) -> Optional[AssetVersionResult]:
    """Get the latest asset version for the specific root asset sequence"""
    results = (await db_session.exec(
        select(Asset, AssetVersion)
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .where(Asset.deleted == None, AssetVersion.deleted == None)
        .where(Asset.asset_seq == asset_seq)
    )).all()
    if not results:
        return None
    results = await asset_q.exec_query_select_asset_latest_version(db_session, asset_seq)
    query_results = await process_join_results([results])
    return query_results[0] if query_results else None


async def get_version(
        db_session: AsyncSession,
        asset_seq: int,
        major: int,
        minor: int,
        patch: int) -> Optional[AssetVersionResult]:
    """Query a specific asset version"""
    results = await asset_q.exec_query_select_asset_by_version(db_session, asset_seq, major, minor, patch)
    if not results:
        return None
    results = await process_join_results(results)
    return results[0]


async def owned_versions(db_session: AsyncSession, profile_seq: int) -> list[AssetVersionResult]:
    """Return versions owned by the specified profile"""
    join_results = await asset_q.exec_query_owned_versions(db_session, profile_seq)
    return await process_join_results(join_results)


async def versions_by_name(db_session: AsyncSession, asset_name: str) -> list[AssetVersionResult]:
    """Return all assets with the same name"""
    join_results = await asset_q.exec_query_assets_by_asset_name(db_session, asset_name)
    return await process_join_results(join_results)


async def version_by_asset_id(db_session: AsyncSession, asset_id: str) -> list[AssetVersionResult]:
    """Return a list of versions for the specified asset"""
    asset_seq = asset_id_to_seq(asset_id)
    join_results = await asset_q.exec_query_assets_by_asset_seq(db_session, asset_seq)
    return await process_join_results(join_results)


async def versions_by_commit_ref(db_session: AsyncSession, commit_ref: str) -> list[AssetVersionResult]:
    join_results = await asset_q.exec_query_assets_by_commit_ref(db_session, commit_ref)
    return await process_join_results(join_results)  # pylint: disable=no-member
