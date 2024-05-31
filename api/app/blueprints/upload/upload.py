import hashlib
import os

from werkzeug.datastructures import FileStorage
from flask import Blueprint, request, jsonify, g, current_app as app
from http import HTTPStatus

from models import gcs_uploader
from models import minio_uploader

import models.db.index as db_index

from context import RequestContext

upload_bp = Blueprint('upload', __name__)


@upload_bp.before_request
def configure_g_storage():
    if g.get('storage') is not None:
        return
    if os.environ.get('GCP_SERVICE_ENABLE') is not None:
        g.storage = gcs_uploader.create_client()  # use default impersonation settings
    g.storage = minio_uploader.create_client()


@upload_bp.route('/stream', methods=['POST'])
def upload_stream():
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
        json, status, ctx = g.storage.upload_stream(
            ctx, request.stream, app.config['BUCKET_NAME'])
    else:
        json, status = jsonify({"message": "file saved"}), HTTPStatus.OK

    # Update database index
    if status == HTTPStatus.OK and app.config['ENABLE_DB']:
        db_index.update(ctx)
    return json, status


@upload_bp.route('/store', methods=['POST'])
def upload():
    if not request.files:
        return jsonify({'error': 'no files'}), HTTPStatus.BAD_REQUEST
    for key, file in request.files.items():
        upload_internal(file)


def upload_internal(file):
    ctx = RequestContext(request)

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
        json, status = g.storage.upload(ctx, app.config['BUCKET_NAME'])
    else:
        json, status = jsonify({"message": "file saved"}), HTTPStatus.OK

    # Update database index
    if status == HTTPStatus.OK and app.config['ENABLE_DB']:
        db_index.update(ctx)

    if app.config['UPLOAD_FOLDER_AUTOCLEAN']:
        os.remove(ctx.local_filepath)
        app.logger.debug("cleaned local file")

    return json, status
