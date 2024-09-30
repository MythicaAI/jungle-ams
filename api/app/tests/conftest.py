from contextlib import contextmanager

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope='session')
def api_base() -> str:
    """Return the current api base"""
    return "/v1"

@contextmanager
@pytest.fixture(scope='module')
def client() -> TestClient:
    """Return a test client for the test module scope"""
    with TestClient(app) as client:
        yield client
