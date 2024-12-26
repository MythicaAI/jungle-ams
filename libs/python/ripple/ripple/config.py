import functools

from pydantic_settings import BaseSettings


class RippleConfig(BaseSettings):
    """Configuration of the ripple library from environment or otherwise"""
    ripple_token_secret_key: str = 'X' * 32  # shared secret for auth token generation
    api_base_uri: str = 'http://localhost:5555/v1'
    mythica_environment: str = "debug"

@functools.lru_cache
def ripple_config() -> RippleConfig:
    """Get the current cached application config"""
    return RippleConfig()
