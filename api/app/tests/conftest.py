# use of defined fixture function names
# pylint: disable=redefined-outer-name,unused-argument
import asyncio
import concurrent.futures
import logging
import os
import tempfile
from contextlib import contextmanager
from typing import Optional

import pytest
import pytest_asyncio
from fastapi import APIRouter, Depends
from fastapi.testclient import TestClient
from sqlmodel.ext.asyncio.session import AsyncSession

from config import app_config
from create_app import create_app
from cryptid.cryptid import profile_id_to_seq
from db.connection import get_db_session
from profiles.start_session import start_session

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


def bind_test_routes(app):
    test_route = APIRouter(prefix='/test')

    @test_route.get('/start_session/{session_profile_id}', tags=['test'])
    async def start_test_session_async(
            session_profile_id: str,
            as_profile_id: Optional[str] = None,
            db_session: AsyncSession = Depends(get_db_session)):
        """Test only route to directly generate a session, this is done on
        a route to ensure that the async context for the database matches
        what has been configured already in the application startup"""
        session_start_response = await start_session(
            db_session,
            profile_id_to_seq(session_profile_id),
            location='test-case',
            impersonate_profile_id=as_profile_id)
        auth_token = session_start_response.token
        return {'token': auth_token}

    app.include_router(test_route)


@contextmanager
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
