from datetime import timedelta
from io import BytesIO
import logging

from cryptid.location import location
from google.cloud import storage
from urllib.parse import quote

from context import UploadContext
from storage.bucket_types import BucketType
from storage.storage_client import StorageClient, tracer

# Configure GCS bucket mappings here directly - this could get more involved as bucket limits,
# regional and migrations occur

GCS_BUCKET_NAMES = {
    BucketType.FILES: 'mythica-public-files',
    BucketType.IMAGES: 'mythica-public-images',
    BucketType.PACKAGES: 'mythica-public-packages',
}


def validate_bucket_mappings():
    """Startup validation that all bucket types are mapped"""
    for bucket_type in BucketType:
        assert bucket_type in GCS_BUCKET_NAMES


validate_bucket_mappings()

log = logging.getLogger(__name__)


class Client(StorageClient):
    """Implementation of GCS storage client"""

    def __init__(self, gcs: storage.Client):
        self.gcs = gcs

    def validate(self):
        return

    def upload(self, ctx: UploadContext, bucket_type: BucketType):
        """Upload the object in the request context to the bucket"""
        with tracer.start_as_current_span("file.upload") as span:
            span.set_attribute("file.id", ctx.file_id if ctx.file_id else "")
            ctx.bucket_name = GCS_BUCKET_NAMES[bucket_type]
            bucket = self.gcs.bucket(ctx.bucket_name)
            object_name = ctx.content_hash + '.' + ctx.extension
            log.info("Upload file to the bucket. id: %s, name: %s", ctx.file_id, object_name)
            span.set_attribute("file.name", object_name)

            blob = bucket.blob(object_name)
            blob.upload_from_filename(ctx.local_filepath)
            ctx.add_object_locator(
                'gcs',
                location() + '.' + ctx.bucket_name,
                object_name)
        log.info("File uploaded", extra={"bucket_name": bucket_type.name, "file_name": object_name})

    def upload_stream(self, ctx: UploadContext, stream: BytesIO, bucket_type: BucketType):
        """Streaming not currently implemented for GCS"""
        raise NotImplementedError

    def download_link(self, bucket_name: str, object_name: str, file_name: str):
        """Get a pre-signed URL to down the object"""
        with tracer.start_as_current_span("file.download") as span:
            span.set_attribute("file.name", object_name)
            log.info("Request to download file from the bucket. name: %s", object_name)
            bucket = self.gcs.bucket(bucket_name)
            blob = bucket.blob(object_name)
        log.info("File download link requested", extra={"bucket_name": bucket_name, "file_name": object_name})

        # Set Content-Disposition header to specify the user-friendly filename
        response_disposition = f'attachment; filename="{quote(file_name)}"'

        return blob.generate_signed_url(
            version="v4",
            expiration=timedelta(days=2),
            method="GET",
            response_disposition=response_disposition)


def create_client():
    """Create the """
    return Client(storage.Client())  # use default impersonation settings
