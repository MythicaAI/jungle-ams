import pytest
from fastapi.testclient import TestClient

from config import app_config
from main import app


@pytest.fixture(scope='session')
def api_base() -> str:
    """Return the current api base"""
    return "/v1"


@pytest.fixture(scope='module')
def client() -> TestClient:
    """Return a test client for the test module scope"""
    return TestClient(app)


@pytest.fixture
def patch_settings_local_storage():
    """Override app's setting"""
    settings = app_config()
    original_settings = settings.model_copy()

    setattr(settings, "use_local_storage", True)

    yield settings

    # Restore the original settings
    settings.__dict__.update(original_settings.__dict__)

