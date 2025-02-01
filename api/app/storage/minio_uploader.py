import hashlib
import logging
from io import BytesIO

from config import app_config
from context import UploadContext
from minio import Minio
from minio.error import S3Error
from storage.bucket_types import BucketType
from storage.storage_client import StorageClient, tracer

log = logging.getLogger(__name__)


def _create_bucket(client: Minio, bucket_type: BucketType) -> str:
    # For local testing with minio - the bucket type enum string
    # can be used directly as there is no namespacing or mapping
    # Make the bucket if it doesn't exist.
    bucket_name = bucket_type.value.lower()
    found = client.bucket_exists(bucket_name)
    if not found:
        client.make_bucket(bucket_name)
        log.info("created bucket %s", bucket_name)
    else:
        log.debug("bucket %s already exists", bucket_name)
    return bucket_name


class Client(StorageClient):
    """Implementation of StorageClient for minio backends"""

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

    def upload(self, ctx: UploadContext, bucket_type: BucketType):
        """
        Upload contents to minio bucket storage backend. This could be S3 or
        any S3 compatible backend including GCS or a minio gateway for
        transparent object migrations.
        """
        with tracer.start_as_current_span("file.upload") as span:
            span.set_attribute("file.id", (ctx.file_id if ctx.file_id else ""))
            ctx.bucket_name = _create_bucket(self.minio, bucket_type)

            ctx.object_name = ctx.content_hash + '.' + ctx.extension
            log.info("Upload file to the minio bucket. id: %s, name: %s", ctx.file_id, ctx.object_name)
            span.set_attribute("file.name", ctx.object_name)
            # Upload the file, renaming it in the process
            try:
                self.minio.fput_object(
                    ctx.bucket_name, ctx.object_name, ctx.local_filepath)
                log.info("%s uploaded to bucket %s", ctx.object_name, ctx.bucket_name)
                ctx.add_object_locator("minio", ctx.bucket_name, ctx.object_name)
            except S3Error as exc:
                log.exception("upload failed to %s:%s", ctx.bucket_name, ctx.object_name)
                raise exc
        log.info("File uploaded", extra={"bucket_name": bucket_type.name, "file_name": ctx.object_name})

    def upload_stream(self, ctx: UploadContext, stream: BytesIO, bucket_type: BucketType):
        """Upload object via the streaming API"""
        ctx.bucket_name = _create_bucket(self.minio, bucket_type)

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
            self.minio.put_object(ctx.bucket_name, object_name, data, length=size)
            log.info("%s uploaded to bucket %s", object_name, ctx.bucket_name)
        except S3Error as exc:
            log.exception("upload failed to %s:%s", ctx.bucket_name, object_name)
            raise exc

        # Finalize hash and location
        ctx.content_hash = hash_sha1.hexdigest()
        ctx.file_size = size
        ctx.add_object_locator('minio', ctx.bucket_name, object_name)

    def download_link(self, bucket_name: str, object_name: str, file_name: str):
        """Get a pre-signed URL to down the object"""
        with tracer.start_as_current_span("file.download") as span:
            span.set_attribute("file.name", object_name)
            log.info("Request to download file from the minio bucket. name: %s", object_name)
        log.info("File download link requested", extra={"bucket_name": bucket_name, "file_name": object_name})
        return self.minio.presigned_get_object(bucket_name, object_name)


def create_client():
    """Create the minio configured storage client"""
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
