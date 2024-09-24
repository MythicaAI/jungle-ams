import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope='session')
def api_base() -> str:
    """Return the current api base"""
    return "/v1"


@pytest.fixture(scope='module')
def client() -> TestClient:
    """Return a test client for the test module scope"""

    # Start the app's startup event programmatically
    with TestClient(app) as test_client:
        # This will ensure both startup and shutdown events are handled properly
        yield test_client
