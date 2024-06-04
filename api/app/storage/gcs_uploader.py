import os
from http import HTTPStatus
from io import BytesIO

from flask import jsonify
from google.cloud import storage

import storage.minio_uploader as minio_uploader
from config import app_config

from context import RequestContext
from storage.storage_client import StorageClient


class Client(StorageClient):
    def __init__(self, gcs: storage.Client):
        self.gcs = gcs

    def validate(self):
        return

    def upload(self, ctx: RequestContext, bucket_name: str):
        ctx.bucket_name = bucket_name
        bucket = self.gcs.bucket(bucket_name)
        ch = ctx.content_hash
        object_name = os.path.join(
            ctx.extension,
            ch[0:2],
            ch[2:4],
            ch[4:6],
            ctx.content_hash + '.' + ctx.extension)

        blob = bucket.blob(object_name)
        blob.upload_from_filename(ctx.local_filepath)
        ctx.add_object_locator('gcs', bucket_name, object_name)

    def upload_stream(self, ctx: RequestContext, stream: BytesIO, bucket_name: str):
        raise NotImplemented


def create_client():
    if app_config().gcp_service_enable:
        return Client(storage.Client())  # use default impersonation settings
    return minio_uploader.create_client()
