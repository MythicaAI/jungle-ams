import logging
import os
from io import BytesIO
from pathlib import Path
import shutil

from config import app_config
from context import RequestContext
from storage.bucket_types import BucketType
from storage.storage_client import StorageClient, upload_counter, download_counter, tracer

log = logging.getLogger(__name__)


class LocalFileStorageClient(StorageClient):
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def validate(self):
        return self.base_path.exists() and self.base_path.is_dir()

    def upload(self, ctx: RequestContext, bucket_type: BucketType) -> str:
        with tracer.start_as_current_span("file.upload") as span:
            span.set_attribute("file.id", ctx.file_id)
            file_id = ctx.content_hash + '.' + ctx.extension
            file_path = self.base_path / f"{ctx.content_hash}.{ctx.extension}"
            file_path.parent.mkdir(parents=True, exist_ok=True)
            span.set_attribute("file.name", file_id)

            log.info("Attempting to upload file: %s to %s", ctx.local_filepath, file_path)

            if not os.path.exists(ctx.local_filepath):
                log.error("Source file does not exist: %s", ctx.local_filepath)
                raise FileNotFoundError(f"Source file does not exist: {ctx.local_filepath}")

            try:
                shutil.copy2(ctx.local_filepath, file_path)
                log.debug("%s successfully copied to %s", file_id, file_path)
            except Exception as e:
                log.error("Error copying file: %s", str(e))
                raise

            ctx.add_object_locator(
                'test',
                'local',
                file_path)
            upload_counter.add(1, {"bucket_name": bucket_type.name, "file_name": file_id})
            return file_id

    def upload_stream(self, ctx: RequestContext, stream: BytesIO, bucket_type: BucketType) -> str:
        file_id = ctx.content_hash + '.' + ctx.extension
        file_path = self.base_path / file_id
        with open(file_path, 'wb') as f:
            f.write(stream.getvalue())
        return file_id

    def download_link(self, bucket_name: str, object_name: str) -> str:
        with tracer.start_as_current_span("file.download") as span:
            span.set_attribute("file.name", object_name)
            # log.info(f"Request to download file locally. name: {object_name}")
            download_counter.add(1, {"bucket_name": bucket_name, "file_name": object_name})
            return object_name


def create_client() -> StorageClient:
    cfg = app_config()
    base_path = cfg.local_storage_path
    return LocalFileStorageClient(base_path)
