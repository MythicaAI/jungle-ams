"""
Application configuration definitions
"""
import functools
import tempfile

from pydantic import Field
from pydantic_settings import BaseSettings

# See https://docs.pydantic.dev/latest/concepts/pydantic_settings/#installation

# Instantiate a temporary directory for the duration of the program lifecycle
temp_dir = tempfile.TemporaryDirectory()


class AppConfig(BaseSettings):
    """This is the config type for the application, it can be modified from the
    environment by defining SETTING_NAME variables"""
    api_base_uri: str = 'http://localhost:5555/v1'
    upload_folder: str = temp_dir.name
    upload_folder_auto_clean: bool = True
    enable_storage: bool = True
    gcs_service_enable: bool = False
    use_local_storage: bool = False
    local_storage_path: str = '/tmp/local_storage'
    minio_tls_enable: bool = False
    minio_access_key: str = 'foo-access'
    minio_secret_key: str = 'bar-secret'
    minio_endpoint: str = 'localhost:9000'

    # default debug API
    auth0_algorithm: str = 'RS256'
    auth0_audience: str = Field('http://localhost:5555/v1', alias='api_base_uri')
    auth0_domain: str = 'dev-dtvqj0iuc5rnb6x2.us.auth0.com'
    auth0_client_id: str = '4CZhQWoNm1WH8l8042LeF38qHrUTR2ax'

    http_listen_addr: str = '0.0.0.0'
    http_listen_port: int = 5555
    enable_db: bool = True
    db_timezone: str = 'UTC'
    sql_url: str = 'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline'

    redis_host: str = 'localhost'
    redis_port: int = 6379
    redis_db: int = 0
    telemetry_enable: bool = False
    telemetry_insecure: bool = False
    telemetry_endpoint: str = "https://ingest.us.signoz.com:443"
    telemetry_token: str = 'doiPcVI9kn0gtNBgiycWZrS6ZbVcLBp1y0vG'

    mythica_org_name: str = "Mythica"

    app_image_version: str = "unknown"


@functools.lru_cache
def app_config() -> AppConfig:
    """Get the current cached application config"""
    return AppConfig()
