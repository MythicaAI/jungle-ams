from io import BytesIO

from context import RequestContext
from storage.bucket_types import BucketType


class StorageClient:
    def validate(self):
        raise NotImplementedError

    def upload(self, ctx: RequestContext, bucket_type: BucketType):
        raise NotImplementedError

    def upload_stream(self, ctx: RequestContext, stream: BytesIO, bucket_type: BucketType):
        raise NotImplementedError

    def download_link(self, bucket_name: str, object_name: str):
        raise NotImplementedError
