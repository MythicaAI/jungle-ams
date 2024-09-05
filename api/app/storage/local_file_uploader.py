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
        object_name = ctx.content_hash + '.' + ctx.extension
        file_path = self.base_path / object_name
        file_path.parent.mkdir(parents=True, exist_ok=True)

        log.info(f"Attempting to upload file: {ctx.local_filepath} to {file_path}")

        if not os.path.exists(ctx.local_filepath):
            log.error(f"Source file does not exist: {ctx.local_filepath}")
            raise FileNotFoundError(f"Source file does not exist: {ctx.local_filepath}")

        try:
            shutil.copy2(ctx.local_filepath, file_path)
            log.debug(f"File successfully copied to {file_path}")
        except Exception as e:
            log.error(f"Error copying file: {str(e)}")
            raise

        ctx.add_object_locator(
            'test',
            "local",
            object_name)
        return file_id

    def upload_stream(self, ctx: RequestContext, stream: BytesIO, bucket_type: BucketType):
        file_id = str(uuid4())
        file_path = self.base_path / file_id
        with open(file_path, 'wb') as f:
            f.write(stream.getvalue())
        return file_id

    def download_link(self, bucket_name: str, object_name: str):
        file_path = Path(self.base_path) / object_name
        return str(file_path.absolute())

def create_client() -> StorageClient:
    cfg = app_config()
    cfg.use_local_storage = True
    base_path = os.environ.get('LOCAL_STORAGE_PATH', '/tmp/local_storage')
    return LocalFileStorageClient(base_path)
