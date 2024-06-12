"""
Application configuration definitions
"""
import tempfile
import functools
from pydantic_settings import BaseSettings

# See https://docs.pydantic.dev/latest/concepts/pydantic_settings/#installation

# Instantiate a temporary directory for the duration of the program lifecycle
temp_dir = tempfile.TemporaryDirectory()


class AppConfig(BaseSettings):
    """This is the config type for the application, it can be modified from the
    environment by defining SETTING_NAME variables"""
    upload_folder: str = temp_dir.name
    upload_folder_auto_clean: bool = True
    enable_storage: bool = True
    gcs_service_enable: bool = False
    bucket_name: str = 'ingest'
    minio_tls_enable: bool = False
    minio_access_key: str = 'foo-access'
    minio_secret_key: str = 'bar-secret'
    minio_endpoint: str = 'localhost:9000'

    http_listen_addr: str = '0.0.0.0'
    http_listen_port: int = 5555
    enable_db: bool = True
    sql_url: str = 'postgresql://test:test@localhost:5432/upload_pipeline'
    secret_key: str = 'test'
    mythica_location: str = 'localhost'


@functools.lru_cache
def app_config() -> AppConfig:
    """Get the current cached application config"""
    return AppConfig()
