import pytest
from fastapi.testclient import TestClient
import asyncio

from main import app
from routes.readers.listener import Listener


@pytest.fixture(scope='session')
def api_base() -> str:
    """Return the current api base"""
    return "/v1"


@pytest.fixture(scope='module')
def client() -> TestClient:
    """Return a test client for the test module scope"""

    @app.on_event("startup")
    async def startup_event():
        asyncio.create_task(Listener().listen_for_changes())

    # Start the app's startup event programmatically
    with TestClient(app) as test_client:
        # This will ensure both startup and shutdown events are handled properly
        yield test_client
