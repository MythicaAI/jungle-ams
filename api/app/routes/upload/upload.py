import hashlib
import os
import shutil
import logging
from datetime import datetime, timezone
from uuid import UUID
from functools import lru_cache
from typing import Annotated

from fastapi import APIRouter, HTTPException, File, UploadFile, Depends
from http import HTTPStatus

from config import app_config
from db.schema.events import Event
from routes.authorization import current_profile
from routes.cdn import translate_download_url
from routes.responses import FileUploadResponse
from routes.file_events import enrich_file, enrich_files
from storage import gcs_uploader, minio_uploader

import db.index as db_index

from pydantic import BaseModel
from context import RequestContext

from sqlmodel import select
from db.connection import get_session
from db.schema.media import FileContent
from db.schema.profiles import Profile
from storage.storage_client import StorageClient

log = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["upload"])

EMPTY_UUID = UUID(int=0, version=4)

class UploadResponse(BaseModel):
    """Response from uploading one or more files"""
    message: str
    files: list[FileUploadResponse]


@lru_cache
def create_storage_client() -> StorageClient:
    """Get a cached storage client implementation based on app configuration"""
    cfg = app_config()
    if not cfg.enable_storage:
        return StorageClient()
    if app_config().gcs_service_enable:
        return gcs_uploader.create_client()
    return minio_uploader.create_client()


async def storage_client() -> StorageClient:
    """The dependency injection method for APIs needing a storage client"""
    return create_storage_client()


@router.post('/store')
async def upload(
        files: list[UploadFile] = File(...),
        profile: Profile = Depends(current_profile),
        storage: StorageClient = Depends(storage_client)) -> UploadResponse:
    log.info("handling upload for profile: %s", profile)

    if not files:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail='no files')

    response_files = []
    for file in files:
        ctx = upload_internal(storage, profile.id, file)
        response_files.append(FileUploadResponse(
            file_id=ctx.file_id,
            owner=ctx.profile_id,
            file_name=file.filename,
            event_ids=[ctx.event_id],
            size=file.size,
            content_type=file.content_type,
            download_url=translate_download_url(ctx.locators, ctx.content_hash),
            content_hash=ctx.content_hash,
            created=datetime.now(timezone.utc)))
    return UploadResponse(
        message=f'uploaded {len(response_files)} files',
        files=response_files)


def upload_internal(storage, profile_id, upload_file) -> RequestContext:
    """Handle internal file upload with a provided storage backend"""
    cfg = app_config()
    ctx = RequestContext()
    ctx.profile_id = profile_id

    filename = upload_file.filename
    extension = filename.rpartition(".")[-1].lower()

    ctx.extension = extension

    # stream the file content to a local file path in the upload folder
    ctx.filename = filename
    ctx.local_filepath = os.path.join(cfg.upload_folder, filename)

    with open(ctx.local_filepath, 'wb') as f:
        shutil.copyfileobj(upload_file.file, f)
    log.info(f'{filename} saved to {ctx.local_filepath}')

    with open(ctx.local_filepath, "rb") as f:
        content = f.read()
        ctx.content_hash = hashlib.sha1(content).hexdigest()
        ctx.file_size = len(content)

    log.info(f"file info: {ctx.local_filepath}, "
             "size: {ctx.file_size}, hash: {ctx.content_hash}")

    # Upload to bucket storage
    if cfg.enable_storage:
        bucket_name = cfg.bucket_name
        storage.upload(ctx, bucket_name)
    else:
        # for testing provide local file locator, these can't be located outside of the
        # machine they live on, NOTE does not currently work
        # ctx.add_object_locator("file", '', ctx.local_filepath)
        pass

    # Update database index
    if cfg.enable_db:
        ctx.file_id, ctx.event_id = db_index.update(ctx)
    else:
        ctx.file_id, ctx.event_id = EMPTY_UUID, EMPTY_UUID

    if cfg.upload_folder_auto_clean:
        os.remove(ctx.local_filepath)
        log.debug("cleaned local file")

    return ctx


@router.get('/pending')
async def pending_uploads(
        profile: Annotated[Profile, Depends(current_profile)]
) -> list[FileUploadResponse]:
    """Get the list of uploads that have been created for
    the current profile"""
    with (get_session() as session):
        owned_files = session.exec(select(FileContent).where(
            FileContent.owner == profile.id)).all()
        return enrich_files(session, owned_files, profile)
