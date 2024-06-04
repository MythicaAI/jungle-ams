import hashlib
import os
import uuid
import logging

from fastapi import APIRouter
from http import HTTPStatus

from storage import gcs_uploader, minio_uploader

import db.index as db_index

from auth.generate_token import validate_token
from auth.cookie import cookie_to_profile

from context import RequestContext

from sqlmodel import select
from db.connection import get_session
from db.schema.media import FileContent
from auth.data import get_profile

log = logging.getLogger(__name__)

router = APIRouter(prefix="/upload")


@router.before_request
def configure_g_storage():
    if g.get('storage') is not None:
        return
    if os.environ.get('GCP_SERVICE_ENABLE') is not None:
        g.storage = gcs_uploader.create_client()  # use default impersonation settings
    g.storage = minio_uploader.create_client()


@router.post('/stream')
async def upload_stream():
    original_filename = request.headers.get('X-Original-File-Name')
    if not original_filename:
        return jsonify({'error': 'Filename header missing'}), 400

    extension = original_filename.rpartition(".")[-1].lower()
    if extension != "hda":
        return jsonify({
            "message": "Only .hda files are currently supported for upload."
        }, status=HTTPStatus.BAD_REQUEST)

    ctx = RequestContext(request)
    ctx.extension = extension

    if app.config['ENABLE_STORAGE']:
        g.storage.upload_stream(
            ctx, request.stream, app.config['BUCKET_NAME'])

    # Update database index
    if app.config['ENABLE_DB']:
        db_index.update(ctx)
    return jsonify({"message": "file saved"}), HTTPStatus.OK


@router.post('/store')
async def upload():
    profile = get_profile(request.headers.get('Authorization'))

    log.info("handling upload for profile: %s", profile)

    if not request.files:
        return jsonify({'error': 'no files'}), HTTPStatus.BAD_REQUEST
    files = list()
    events = list()
    for key, file in request.files.items():
        file_id, event_id = upload_internal(profile.id, file)
        files.append(file_id)
        events.append(event_id)
    return jsonify({'message': f'uploaded {len(events)} files',
                    'files': files,
                    'events': events}), HTTPStatus.OK


def upload_internal(profile_id, file):
    ctx = RequestContext(request)
    ctx.profile_id = profile_id

    filename = file.filename
    extension = filename.rpartition(".")[-1].lower()
    if extension != "hda":
        return jsonify({
            "message": "Only .hda files are currently supported for upload."
        }, status=HTTPStatus.BAD_REQUEST)
    ctx.extension = extension

    # stream the file content to a local file path in the upload folder
    ctx.filename = filename
    ctx.local_filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    file.save(ctx.local_filepath)
    app.logger.info(
        f'{filename} saved to {ctx.local_filepath}')

    with open(ctx.local_filepath, "rb") as f:
        content = f.read()
        ctx.content_hash = hashlib.sha1(content).hexdigest()
        ctx.file_size = len(content)

    app.logger.info(
        f"file info: {ctx.local_filepath}, size: {ctx.file_size}, hash: {ctx.content_hash}")

    # Upload to bucket storage
    if app.config['ENABLE_STORAGE']:
        g.storage.upload(ctx, app.config['BUCKET_NAME'])

    # Update database index
    if app.config['ENABLE_DB']:
        event_id = db_index.update(ctx)
    else:
        event_id = uuid.UUID(int=0, version=4)

    if app.config['UPLOAD_FOLDER_AUTOCLEAN']:
        os.remove(ctx.local_filepath)
        app.logger.debug("cleaned local file")

    return event_id


@router.get('/pending')
async def pending_uploads():
    """Get the list of uploads that have been created for the current profile"""
    profile = get_profile(request.headers.get('Authorization'))
    with get_session() as session:
        uploaded = session.exec(select(FileContent).where(FileContent.owner == profile.id))
        results = list()
        size_bytes = 0
        for u in uploaded:
            results.append(u.model_dump())
            size_bytes += u.size
        return jsonify({'message': 'ok', 'total_size': size_bytes, 'results': results}), HTTPStatus.OK
