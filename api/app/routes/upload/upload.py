import hashlib
import logging
import os
import random
import shutil
import string
from datetime import datetime, timezone
from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlmodel import and_, select, update

import db.index as db_index
from assets.repo import convert_version_input, process_join_results, select_asset_version
from config import app_config
from content.validate_filename import validate_filename
from context import UploadContext
from cryptid.cryptid import asset_id_to_seq, file_id_to_seq
from db.connection import get_session
from db.schema.assets import AssetVersion
from db.schema.media import FileContent
from db.schema.profiles import Profile
from ripple.models.contexts import FilePurpose
from ripple.models.sessions import SessionProfile
from routes.authorization import session_profile
from routes.file_uploads import FileUploadResponse, enrich_files
from routes.files.files import delete_by_id
from routes.storage_client import storage_client
from storage.bucket_types import BucketType
from storage.storage_client import StorageClient

log = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["upload"])

DEFAULT_BUCKET_TYPE = BucketType.FILES

USER_BUCKET_MAPPINGS = {
    BucketType.IMAGES: {'png', 'jpg', 'jpeg', 'gif', 'webm'},
}

PACKAGE_BUCKET_MAPPINGS = {
    BucketType.PACKAGES: {'zip'}
}


class UploadResponse(BaseModel):
    """Response from uploading one or more files"""
    message: str
    files: list[FileUploadResponse]


def get_target_bucket(mappings: dict[BucketType, set], extension: str) -> BucketType:
    """Map an extension to a target bucket used for storage"""
    for bucket_type, extension_set in mappings.items():
        if extension in extension_set:
            return bucket_type
    return DEFAULT_BUCKET_TYPE


async def upload_internal(
        storage: StorageClient,
        bucket_mappings: dict[BucketType, set],
        profile: SessionProfile,
        owner_id: str,
        upload_file: UploadFile) -> UploadContext:
    """Handle internal file upload with a provided storage backend"""
    cfg = app_config()
    ctx = UploadContext(purpose=FilePurpose.API_UPLOAD, profile=profile, owner_id=owner_id)

    filename = upload_file.filename
    validate_filename(filename)
    extension = filename.rpartition(".")[-1].lower()

    ctx.extension = extension

    # stream the file content to a local file path in the upload folder
    ctx.filename = filename

    random_filename = ''.join(random.choice(string.ascii_letters + string.digits)
                              for _ in range(20))
    ctx.local_filepath = os.path.join(cfg.upload_folder, random_filename)

    with open(ctx.local_filepath, 'wb') as f:
        shutil.copyfileobj(upload_file.file, f)
    log.info('%s saved to %s', filename, ctx.local_filepath)

    page_size = 64 * 1024
    file_size = 0
    sha1 = hashlib.sha1()
    with open(ctx.local_filepath, "rb") as f:
        chunk: bytes
        while chunk := f.read(page_size):
            sha1.update(chunk)
            file_size += len(chunk)

    ctx.content_hash = sha1.hexdigest()
    ctx.file_size = file_size

    log.info("file: %s, size: %s, hash: %s",
             ctx.local_filepath,
             ctx.file_size,
             ctx.content_hash)

    # Upload to bucket storage
    if cfg.enable_storage:
        bucket_type = get_target_bucket(bucket_mappings, extension)
        if bucket_type is None:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, f'extension {extension} not supported')
        storage.upload(ctx, bucket_type)
    else:
        # for testing provide local file locator, these can't be located outside the
        # machine they live on, NOTE files are not actually resolvable, this provides
        # unit test support
        ctx.add_object_locator('test', 'local', ctx.local_filepath)

    # Update database index
    if cfg.enable_db:
        ctx.file_id, ctx.event_id = await db_index.update(ctx)
    else:
        ctx.file_id, ctx.event_id = '', ''

    if cfg.upload_folder_auto_clean:
        os.remove(ctx.local_filepath)
        log.debug("cleaned local file")

    return ctx


@router.post('/store')
async def store_files(
        files: list[UploadFile] = File(...),
        profile: SessionProfile = Depends(session_profile),
        storage: StorageClient = Depends(storage_client)) -> UploadResponse:
    """Store a list of files as a profile"""

    log.info("handling upload for profile: %s", profile)

    if not files:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail='no files')

    response_files = []
    for file in files:
        # do the upload
        ctx = await upload_internal(
            storage,
            USER_BUCKET_MAPPINGS,
            profile,
            profile.profile_id,
            file)

        # create a response file object for the upload
        response_files.append(FileUploadResponse(
            file_id=ctx.file_id,
            owner_id=profile.profile_id,
            file_name=file.filename,
            event_ids=[ctx.event_id],
            size=file.size,
            content_type=file.content_type,
            content_hash=ctx.content_hash,
            created=datetime.now(timezone.utc)))
    return UploadResponse(
        message=f'uploaded {len(response_files)} files',
        files=response_files)


@router.post('/package/{asset_id}/{version_str}')
async def store_and_attach_package(
        asset_id: str,
        version_str: str,
        files: list[UploadFile] = File(...),
        storage: StorageClient = Depends(storage_client),
        profile: SessionProfile = Depends(session_profile)) -> UploadResponse:
    """Provide a package upload to a specific asset and version"""
    if not files:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail='no files')
    if len(files) != 1:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail='only one package at a time supported')
    file = files[0]
    if file.content_type is None:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=f'no content type for file {file.filename}')

    version_id = convert_version_input(version_str)

    log.info("package uploading for asset: %s %s", asset_id, version_id)
    response_files = []

    # do the upload
    with get_session(echo=True) as session:
        avr_results = select_asset_version(session, asset_id, version_id)
        avr = process_join_results(session, avr_results)[0] if avr_results else None
        if avr is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"asset: {asset_id}/{version_id} not found")

        ctx = await upload_internal(
            storage,
            PACKAGE_BUCKET_MAPPINGS,
            profile,
            profile.profile_id,
            file)

        # create a response file object for the upload
        response_files.append(FileUploadResponse(
            file_id=ctx.file_id,
            owner_id=ctx.profile.profile_id,
            file_name=file.filename,
            event_ids=[ctx.event_id],
            size=file.size,
            content_type=file.content_type,
            content_hash=ctx.content_hash,
            created=datetime.now(timezone.utc)))

        # if a package existed, mark it as deleted
        if avr.package_id:
            try:
                await delete_by_id(avr.package_id, profile)
            except HTTPException:
                log.exception("cleanup of existing package %s failed", avr.package_id)

        # attach the response to the asset version
        asset_seq = asset_id_to_seq(asset_id)
        stmt = update(AssetVersion).values(
            {AssetVersion.package_seq: file_id_to_seq(ctx.file_id)}).where(
            AssetVersion.asset_seq == asset_seq).where(
            AssetVersion.major == version_id[0]).where(
            AssetVersion.minor == version_id[1]).where(
            AssetVersion.patch == version_id[2])
        session.exec(stmt)
        session.commit()

    return UploadResponse(
        message=f'uploaded {len(response_files)} files',
        files=response_files)


@router.get('/pending')
async def pending(
        profile: Annotated[Profile, Depends(session_profile)]) -> list[FileUploadResponse]:
    """Get the list of uploads that have been created for
    the current profile"""
    with (get_session() as session):
        owned_files = session.exec(select(FileContent)
        .where(
            and_(FileContent.owner_seq == profile.profile_seq,
                 FileContent.deleted == None))).all()
        return enrich_files(session, owned_files, profile)
