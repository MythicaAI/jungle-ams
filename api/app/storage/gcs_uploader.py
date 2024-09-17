from datetime import timedelta
from io import BytesIO

from google.cloud import storage

from config import app_config
from context import RequestContext
from storage.bucket_types import BucketType
from storage.storage_client import StorageClient

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


class Client(StorageClient):
    """Implementation of GCS storage client"""

    def __init__(self, gcs: storage.Client):
        self.gcs = gcs

    def validate(self):
        return

    def upload(self, ctx: RequestContext, bucket_type: BucketType):
        """Upload the object in the request context to the bucket"""
        ctx.bucket_name = GCS_BUCKET_NAMES[bucket_type]
        bucket = self.gcs.bucket(ctx.bucket_name)
        object_name = ctx.content_hash + '.' + ctx.extension

        blob = bucket.blob(object_name)
        blob.upload_from_filename(ctx.local_filepath)
        ctx.add_object_locator(
            'gcs',
            app_config().mythica_location + '.' + ctx.bucket_name,
            object_name)

    def upload_stream(self, ctx: RequestContext, stream: BytesIO, bucket_type: BucketType):
        """Streaming not currently implemented for GCS"""
        raise NotImplementedError

    def download_link(self, bucket_name: str, object_name: str):
        """Get a pre-signed URL to down the object"""
        bucket = self.gcs.bucket(bucket_name)
        blob = bucket.blob(object_name)
        return blob.generate_signed_url(version="v4", expiration=timedelta(days=7), method="GET")


def create_client():
    """Create the """
    return Client(storage.Client())  # use default impersonation settings
