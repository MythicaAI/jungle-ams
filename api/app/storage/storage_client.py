from io import BytesIO

from context import RequestContext


class StorageClient:
    def validate(self):
        raise NotImplementedError

    def upload(self, ctx: RequestContext, bucket_name: str):
        raise NotImplementedError

    def upload_stream(self, ctx: RequestContext, stream: BytesIO, bucket_name: str):
        raise NotImplementedError

    def download_link(self, bucket_name: str, object_name: str):
        raise NotImplementedError
