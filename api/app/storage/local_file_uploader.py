import logging
import os
from io import BytesIO
from pathlib import Path
import shutil
from uuid import uuid4

from config import app_config
from context import RequestContext
from storage.bucket_types import BucketType
from storage.storage_client import StorageClient


log = logging.getLogger(__name__)

class LocalFileStorageClient(StorageClient):
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def validate(self):
        return self.base_path.exists() and self.base_path.is_dir()

    def upload(self, ctx: RequestContext, bucket_type: BucketType):
        file_id = str(uuid4())
        file_path = self.base_path / f"{ctx.content_hash}.{ctx.extension}"
        file_path.parent.mkdir(parents=True, exist_ok=True)

        log.info("Attempting to upload file: %s to %s", ctx.local_filepath, file_path)

        if not os.path.exists(ctx.local_filepath):
            log.error("Source file does not exist: %s", ctx.local_filepath)
            raise FileNotFoundError(f"Source file does not exist: {ctx.local_filepath}")

        try:
            shutil.copy2(ctx.local_filepath, file_path)
            log.debug("File successfully copied to %s", file_path)
        except Exception as e:
            log.error("Error copying file: %s", str(e))
            raise

        ctx.add_object_locator(
            'test',
            "local",
            file_path)
        return file_id

    def upload_stream(self, ctx: RequestContext, stream: BytesIO, bucket_type: BucketType):
        file_id = str(uuid4())
        file_path = self.base_path / file_id
        with open(file_path, 'wb') as f:
            f.write(stream.getvalue())
        return file_id

    def download_link(self, bucket_name: str, object_name: str) -> str:
        return object_name


def create_client() -> StorageClient:
    cfg = app_config()
    base_path = cfg.local_storage_path
    return LocalFileStorageClient(base_path)
