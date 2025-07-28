# use of defined fixture function names
# pylint: disable=redefined-outer-name,unused-argument
import asyncio
import concurrent.futures
import logging
import os
import tempfile
from unittest.mock import Mock, patch

import pytest
import pytest_asyncio
from config import app_config
from create_app import create_app
from fastapi.testclient import TestClient
from tests.bind_test_routes import bind_test_routes

log = logging.getLogger(__name__)

print("conftest-debug")


@pytest.fixture(scope='session', autouse=True)
def setup_database(verbose_db=False):
    """
    Set up the local database for testing
    """
    if verbose_db:
        logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
        logging.getLogger('sqlalchemy.pool').setLevel(logging.DEBUG)

    if True or os.environ.get("SQL_URL"):
        log.info("SQL_URL detected in environment, skip setup_database fixture")
        yield False
    else:
        with (tempfile.TemporaryDirectory() as tmp_dir):
            db_path = os.path.join(tmp_dir, 'mythica.db')
            local_storage_path = os.path.join(tmp_dir, 'local_storage')
            sql_url = f"sqlite+aiosqlite:///{db_path}"
            os.environ["SQL_URL"] = sql_url

            cfg = app_config()

            cfg.sql_url = sql_url
            cfg.local_storage_path = local_storage_path
            cfg.use_local_storage = True
            cfg.upload_folder_auto_clean = False

            log.info("setup_database fixture configured %s", db_path)


@pytest.fixture(scope='package')
def api_base(setup_database) -> str:
    """Return the current api base"""
    return "/v1"


@pytest_asyncio.fixture(scope='session')
async def client() -> TestClient:
    """Return a test client for the test module scope"""
    # event_loop = asyncio.get_running_loop()
    event_loop = asyncio.get_running_loop()
    print(f"fixture `client` in event_loop {id(event_loop)}")
    executor = concurrent.futures.ThreadPoolExecutor(
        thread_name_prefix='app-test-executor'
    )
    event_loop.set_default_executor(executor)

    app = create_app(use_prom=False, intercept_exceptions=False)
    bind_test_routes(app)
    with TestClient(app) as c:
        yield c
        executor.shutdown(wait=True)
    del app


@pytest.fixture(scope='module')
def mock_mail_send_success():
    """"Mock a success of the SendGrid send method"""
    with patch('sendgrid.SendGridAPIClient.send') as mock_send:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.body = "Email sent successfully"
        mock_response.headers = {'Content-Type': 'application/json'}

        mock_send.return_value = mock_response

        yield mock_send
