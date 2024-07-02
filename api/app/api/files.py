import logging
from http import HTTPStatus
from uuid import UUID
import json

from minio import Minio
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings
from google.cloud import storage
from google.cloud.storage import Blob

from munch import munchify

log = logging.getLogger(__name__)


class ApiSettings(BaseSettings):
    endpoint: str = "http://localhost:5555/api/v1"
    gcs_client_creds_path: str = "/Users/jrepp/tmp/hautomation-bucket-key.json"
    minio_access_key: str = 'foo-access'
    minio_secret_key: str = 'bar-secret'
    minio_tls_enable: bool = False
    minio_endpoint: str = 'localhost:9000'

@lru_cache
def api_settings() -> ApiSettings:
    return ApiSettings()


def create_minio_client():
    cfg = api_settings()
    tls_enable = cfg.minio_tls_enable
    access = cfg.minio_access_key
    secret = cfg.minio_secret_key
    endpoint = cfg.minio_endpoint
    log.info("MINIO_ENDPOINT: %s", endpoint)
    log.info("MINIO_ACCESS_KEY: %s", access)
    return Minio(endpoint,
                 access_key=access,
                 secret_key=secret,
                 secure=tls_enable)


class API(object):
    """
    API wrapper
    """

    def __init__(self, client):
        self.settings = api_settings()
        self.client = client

    def download_file_from_locator(self, locator: str, destination: Path) -> Path:
        """Download a file locator to a local destination folder, return path"""
        # self.locators.append(f"{backend}://{bucket_name}:{object_name}")
        backend, bucket_file = locator.split('://')
        bucket, file_name = bucket_file.split(':')
        destination = destination / Path(file_name)
        if backend == 'gcs':
            gcs = storage.Client()
            download: Blob = gcs.bucket(bucket).blob(file_name)
            download.download_to_filename(str(destination))
            return destination
        elif backend == 'minio':
            minio = create_minio_client()
            minio.fget_object(bucket, file_name, str(destination))
            return destination
        return None

    def download_file(self, file_id: UUID, local_path: Path) -> Path:
        """Download a file_id to a local path"""
        url = f"{api_settings().endpoint}/files/{file_id}"
        r = self.client.get(url)
        assert r.status_code == HTTPStatus.OK
        doc = r.json()
        log.info("response: %s", json.dumps(doc))
        o = munchify(doc)
        log.info("downloading from %s to %s",
                 o.download_url,
                 local_path)
