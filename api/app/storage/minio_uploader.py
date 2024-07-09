import hashlib
import logging
from io import BytesIO

from minio import Minio
from minio.error import S3Error

from config import app_config
from context import RequestContext
from storage.storage_client import StorageClient

log = logging.getLogger(__name__)


def _create_bucket(client: Minio, bucket_name: str):
    # Make the bucket if it doesn't exist.
    found = client.bucket_exists(bucket_name)
    if not found:
        client.make_bucket(bucket_name)
        log.info("created bucket %s", bucket_name)
    else:
        log.debug("bucket %s already exists", bucket_name)


class Client(StorageClient):
    def __init__(self, minio):
        self.minio = minio

    def validate(self) -> None:
        """
        Validates the availability of buckets using the create_client() method
        and logs the bucket name using the log.info() method.

        :return: None
        """
        for b in self.minio.list_buckets():
            log.info("validate: %s bucket available", b)

    def upload(self, ctx: RequestContext, bucket_name: str):
        """
        Upload contents to minio bucket storage backend. This could be S3 or
        any S3 compatible backend including GCS or a minio gateway for
        transparent object migrations.
        """
        _create_bucket(self.minio, bucket_name)

        ctx.bucket_name = bucket_name
        ctx.object_name = ctx.content_hash + '.' + ctx.extension
        # Upload the file, renaming it in the process
        try:
            self.minio.fput_object(
                ctx.bucket_name, ctx.object_name, ctx.local_filepath)
            log.info("%s uploaded to bucket %s", ctx.object_name, ctx.bucket_name)
            ctx.add_object_locator("minio", ctx.bucket_name, ctx.object_name)
        except S3Error as exc:
            log.exception("upload failed to %s:%s", ctx.bucket_name, ctx.object_name)
            raise from ex

    def upload_stream(self, ctx: RequestContext, stream: BytesIO, bucket_name: str):
        _create_bucket(self.minio, bucket_name)

        object_name = ctx.content_hash + '.' + ctx.extension

        # Initialize hash
        hash_sha1 = hashlib.sha1()

        # Prepare to upload
        data = BytesIO()

        try:
            # Read stream, update hash and buffer data
            while chunk := stream.read(4096):
                hash_sha1.update(chunk)
                data.write(chunk)

            data.seek(0)  # Rewind the buffered data for upload
            size = data.tell()  # Get the size of the data

            # Upload the data
            self.minio.put_object(bucket_name, object_name, data, length=size)
            log.info("%s uploaded to bucket %s", object_name, bucket_name)
        except S3Error as exc:
            log.exception("upload failed to %s:%s", bucket_name, object_name)
            raise from exc

        # Finalize hash and location
        ctx.content_hash = hash_sha1.hexdigest()
        ctx.file_size = size
        ctx.add_object_locator('minio', bucket_name, object_name)

    def download_link(self, bucket_name: str, object_name: str):
        return self.minio.presigned_get_object(bucket_name, object_name)


def create_client():
    cfg = app_config()
    tls_enable = cfg.minio_tls_enable
    access = cfg.minio_access_key
    secret = cfg.minio_secret_key
    endpoint = cfg.minio_endpoint
    log.info("MINIO_ENDPOINT: %s", endpoint)
    log.info("MINIO_ACCESS_KEY: %s", access)
    return Client(Minio(endpoint,
                        access_key=access,
                        secret_key=secret,
                        secure=tls_enable))
