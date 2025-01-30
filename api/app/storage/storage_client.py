from io import BytesIO

from context import UploadContext
from storage.bucket_types import BucketType
from opentelemetry import trace


class StorageClient:
    def validate(self):
        raise NotImplementedError

    def upload(self, ctx: UploadContext, bucket_type: BucketType):
        raise NotImplementedError

    def upload_stream(self, ctx: UploadContext, stream: BytesIO, bucket_type: BucketType):
        raise NotImplementedError

    def download_link(self, bucket_name: str, object_name: str):
        raise NotImplementedError


tracer = trace.get_tracer(__name__)
