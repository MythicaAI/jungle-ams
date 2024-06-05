import hashlib
import os
import shutil
import uuid
import logging
from functools import lru_cache
from typing import Annotated

from fastapi import APIRouter, HTTPException, File, UploadFile, Header, Depends
from http import HTTPStatus

from config import app_config
from routes.responses import ListResponse
from storage import gcs_uploader, minio_uploader

import db.index as db_index

from auth.generate_token import validate_token
from auth.cookie import cookie_to_profile

from pydantic import BaseModel
from context import RequestContext

from sqlmodel import select
from db.connection import get_session
from db.schema.media import FileContent
from db.schema.profiles import Profile
from auth.data import get_profile
from storage.storage_client import StorageClient

log = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["upload"])


async def current_profile(authorization: str = Header("Authorization")):
    return get_profile(authorization)


@lru_cache
def create_storage_client() -> StorageClient:
    if app_config().gcs_service_enable:
        return gcs_uploader.create_client()  # use default impersonation settings
    return minio_uploader.create_client()


async def storage_client() -> StorageClient:
    return create_storage_client()


# @router.post('/stream')
# async def upload_stream():
#     original_filename = request.headers.get('X-Original-File-Name')
#     if not original_filename:
#         return jsonify({'error': 'Filename header missing'}), 400
#
#     extension = original_filename.rpartition(".")[-1].lower()
#     if extension != "hda":
#         return jsonify({
#             "message": "Only .hda files are currently supported for upload."
#         }, status=HTTPStatus.BAD_REQUEST)
#
#     ctx = RequestContext(request)
#     ctx.extension = extension
#
#     if app.config['ENABLE_STORAGE']:
#         g.storage.upload_stream(
#             ctx, request.stream, app.config['BUCKET_NAME'])
#
#     # Update database index
#     if app.config['ENABLE_DB']:
#         db_index.update(ctx)
#     return jsonify({"message": "file saved"}), HTTPStatus.OK


class UploadResponse(BaseModel):
    message: str
    files: list[uuid.UUID]
    events: list[uuid.UUID]


@router.post('/store')
async def upload(
        files: list[UploadFile] = File(...),
        profile: Profile = Depends(current_profile),
        storage: StorageClient = Depends(storage_client)) -> UploadResponse:
    log.info("handling upload for profile: %s", profile)
    storage.validate()

    if not files:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail='no files')

    contents = list()
    events = list()
    for file in files:
        file_id, event_id = upload_internal(storage, profile.id, file)
        contents.append(file_id)
        events.append(event_id)
    return UploadResponse(
        message=f'uploaded {len(events)} files',
        files=contents,
        events=events)


def upload_internal(storage, profile_id, upload_file):
    cfg = app_config()
    ctx = RequestContext()
    ctx.profile_id = profile_id

    filename = upload_file.filename
    extension = filename.rpartition(".")[-1].lower()
    if extension != "hda":
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail="Only .hda files are currently supported for upload.")
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

    log.info(
        f"file info: {ctx.local_filepath}, size: {ctx.file_size}, hash: {ctx.content_hash}")

    # Upload to bucket storage
    if cfg.enable_storage:
        bucket_name = cfg.bucket_name
        storage.upload(ctx, bucket_name)

    # Update database index
    if cfg.enable_db:
        event_id = db_index.update(ctx)
    else:
        event_id = uuid.UUID(int=0, version=4)

    if cfg.upload_folder_auto_clean:
        os.remove(ctx.local_filepath)
        log.debug("cleaned local file")

    return event_id


@router.get('/pending')
async def pending_uploads(
        profile: Annotated[Profile, Depends(current_profile)]) -> list[FileContent]:
    """Get the list of uploads that have been created for the current profile"""
    with get_session() as session:
        return session.exec(select(FileContent).where(FileContent.owner == profile.id)).all()
