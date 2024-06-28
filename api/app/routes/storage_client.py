from functools import lru_cache

from config import app_config
from storage import gcs_uploader, minio_uploader
from storage.storage_client import StorageClient


@lru_cache
def create_storage_client() -> StorageClient:
    """Get a cached storage client implementation based on app configuration"""
    cfg = app_config()
    if not cfg.enable_storage:
        return StorageClient()
    if app_config().gcs_service_enable:
        return gcs_uploader.create_client()
    return minio_uploader.create_client()


async def storage_client() -> StorageClient:
    """The dependency injection method for APIs needing a storage client"""
    return create_storage_client()
