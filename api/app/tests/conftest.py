from contextlib import contextmanager

import os
import tempfile

import pytest
import logging

from fastapi.testclient import TestClient

from main import app
from config import app_config

log = logging.getLogger(__name__)

print("conftest-debug")

@pytest.fixture(scope='package', autouse=True)
def setup_database():
    """
    Set up the local database for testing
    """

    if True or os.environ.get("SQL_URL"):
        log.info("SQL_URL detected in environment, skip setup_database fixture")
        yield False
    else:
        with (tempfile.TemporaryDirectory() as tmp_dir):
            db_path = os.path.join(tmp_dir, 'mythica.db')
            local_storage_path = os.path.join(tmp_dir, 'local_storage')
            sql_url = f"sqlite:///{db_path}"
            os.environ["SQL_URL"] = sql_url

            cfg = app_config()

            cfg.sql_url = sql_url
            cfg.local_storage_path = local_storage_path
            cfg.use_local_storage = True
            cfg.upload_folder_auto_clean = False

            log.info(f"setup_database fixture configured {db_path}")

            yield True


@pytest.fixture(scope='package')
def api_base(setup_database) -> str:
    """Return the current api base"""
    return "/v1"

@contextmanager
@pytest.fixture(scope='module')
def client() -> TestClient:
    """Return a test client for the test module scope"""
    with TestClient(app) as c:
        yield c
