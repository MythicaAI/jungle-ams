import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope='session')
def api_base() -> str:
    """Return the current api base"""
    return "/api/v1"


@pytest.fixture(scope='module')
def client() -> TestClient:
    """Return a test client for the test module scope"""
    return TestClient(app)
