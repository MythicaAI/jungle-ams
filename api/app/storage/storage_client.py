from io import BytesIO

from context import RequestContext


class StorageClient:
    def validate(self):
        raise NotImplemented
    def upload(self, ctx: RequestContext, bucket_name: str):
        raise NotImplemented

    def upload_stream(self, ctx: RequestContext, stream: BytesIO, bucket_name: str):
        raise NotImplemented

