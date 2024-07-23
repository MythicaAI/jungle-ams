import json
import logging
import os
from functools import lru_cache
from http import HTTPStatus
from pathlib import Path

from minio import Minio
from munch import munchify
from pydantic_settings import BaseSettings

log = logging.getLogger(__name__)


class ApiSettings(BaseSettings):
    endpoint: str = "http://localhost:5555/v1"
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

    def download_file(self, file_id: str, local_path: Path) -> Path:
        """Download a file_id to a local path"""
        url = f"{api_settings().endpoint}/download/info/{file_id}"
        r = self.client.get(url)
        assert r.status_code == HTTPStatus.OK
        doc = r.json()
        log.info("response: %s", json.dumps(doc))
        o = munchify(doc)
        local_file_name = os.path.join(local_path, o.name)
        log.info("downloading from %s to %s",
                 o.url,
                 local_file_name)
        bytes = 0
        with open(local_file_name, "wb") as f:
            download_req = self.client.get(o.url, stream=True)
            for chunk in download_req.iter_content(chunk_size=1024):
                if chunk:
                    bytes += len(chunk)
                    f.write(chunk)
        log.info(f"download complete, {bytes} bytes")
        return Path(local_file_name)
