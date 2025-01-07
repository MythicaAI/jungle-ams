from io import BytesIO

from context import UploadContext
from storage.bucket_types import BucketType
from opentelemetry import trace
from opentelemetry.metrics import get_meter_provider


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

meter = get_meter_provider().get_meter("storage.client", version="1.0.0")
upload_counter = meter.create_counter(
    name="file_uploads_total",
    description="Counts the number of files uploaded",
    unit="1",
)
download_counter = meter.create_counter(
    name="file_downloads_total",
    description="Counts the number of file download requests",
    unit="1",
)
