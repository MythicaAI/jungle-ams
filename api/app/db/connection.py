# pylint: disable=no-member,broad-exception-caught

import asyncio
import functools
import inspect
import logging
import os
from collections.abc import AsyncGenerator
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import Callable
from zoneinfo import ZoneInfo

import sqltap
from config import app_config
from fastapi import FastAPI, Request
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from ripple.config import ripple_config
from sqlalchemy.ext.asyncio import AsyncSession as SQLA_AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.sql import text
from sqlmodel.ext.asyncio.session import AsyncSession

log = logging.getLogger(__name__)

#
# The database by default should be configured for UTC, however for the case where
# a local SQLite database is automatically generating timestamps they will be in the
# timezone of the local machine as per the SQLite implementation. Timestamps coming
# of the database should be normalized to UTC before they are delivered to any clients
# of the API.
#
TZ = ZoneInfo(app_config().db_timezone)


@asynccontextmanager
async def db_connection_lifespan(app: FastAPI):
    """Lifecycle management of the database connection"""
    engine_url = app_config().sql_url.strip()
    connect_args = {}

    # explicitly set the asyncpg event loop and TE to prevent futures
    # awaited from different local event loops
    if "asyncpg" in engine_url:
        loop = asyncio.get_running_loop()
        loop.set_default_executor(ThreadPoolExecutor())
        connect_args.update(loop=loop)
        print(f"asyncpg configured with event loop: {id(loop)}")

    db_engine = create_async_engine(
        engine_url,
        echo=False,
        future=True,
        connect_args=connect_args)
    if app_config().telemetry_enable:
        SQLAlchemyInstrumentor().instrument(engine=db_engine.sync_engine)


    log.info("database engine %s, driver: %s",
             db_engine.dialect.name, db_engine.dialect.driver)

    create_sqlmodel_session = async_sessionmaker(
        bind=db_engine,
        class_=AsyncSession,
        expire_on_commit=False)
    create_sqlalchemy_session = async_sessionmaker(
        bind=db_engine,
        class_=SQLA_AsyncSession,
        expire_on_commit=False)

    # test creating a new session on SQLAlchemy - this is required
    # to use the greenlet workaround internally in their code to run a sync function
    session = create_sqlalchemy_session()

    # Setup fallbacks for features that exist in postgres but not sqlite
    if db_engine.dialect.name == "sqlite":
        try:
            def create_sequence(sync_session):
                sync_session.execute(
                    text("CREATE TABLE IF NOT EXISTS app_sequences (seq INTEGER DEFAULT 1, name TEXT PRIMARY KEY);"))
                sync_session.commit()
                log.info("sqlite fallbacks installed")

            await session.run_sync(create_sequence)
        finally:
            pass
    try:
        await session.close()  # give the test session back to the engine
        app.state.db_engine = db_engine
        app.state.create_sqlmodel_session = create_sqlmodel_session
        yield db_engine
        del app.state.db_engine
        del app.state.create_sqlmodel_session

    except GeneratorExit:
        pass
    finally:
        log.info("database engine disconnected %s", db_engine.name)
        await db_engine.dispose()


@asynccontextmanager
async def db_session_pool(app: FastAPI) -> AsyncGenerator[AsyncSession, None]:
    """Get a scoped database session using pool connections"""
    db_engine = app.state.db_engine
    create_sqlmodel_session = app.state.create_sqlmodel_session
    if db_engine is None or create_sqlmodel_session is None:
        raise ValueError("engine is not available")
    db_session = None
    try:
        db_session = create_sqlmodel_session()
        yield db_session
    except GeneratorExit:
        pass
    finally:
        # check the session back in
        if db_session is not None:
            await db_session.close()


async def get_db_session(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """Fast API Depends() compatible AsyncExit construction of the session, uses
    async context manager to handle session state cleanup"""
    async with db_session_pool(request.app) as db_session:
        yield db_session

def sql_profiler_decorator(func: Callable):
    """Decorator to profile SQL queries for FastAPI route handlers"""
    folder_for_reports = "sql-reports/"
    # Ensure the folder exists
    if not os.path.exists(folder_for_reports):
        os.makedirs(folder_for_reports)

    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        # Start the SQL profiler
        if not ripple_config().mythica_environment == "debug":
            return await func(*args, **kwargs)
        profiler = sqltap.start()
        log.error("SQL-query Profiler has written report")
        try:
            # Call the original function
            result = await func(*args, **kwargs)
        finally:
            # Collect and report the SQL statistics
            statistics = profiler.collect()
            try:
                file_name = f"{folder_for_reports}{func.__module__}.{func.__name__}.html"
                sqltap.report(statistics, file_name)
                log.info("SQL-query Profiler has written report %s", file_name)
            except PermissionError:
                log.error("SQL-query Profiler failed to write report")
        return result

    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        # Start the SQL profiler
        if not ripple_config().mythica_environment == "debug":
            return func(*args, **kwargs)
        profiler = sqltap.start()
        try:
            # Call the original function
            result = func(*args, **kwargs)
        finally:
            # Collect and report the SQL statistics
            statistics = profiler.collect()
            try:
                file_name = f"{folder_for_reports}{func.__module__}.{func.__name__}.html"
                sqltap.report(statistics, file_name)
                log.info("SQL-query Profiler has written report %s", file_name)
            except PermissionError:
                log.error("SQL-query Profiler failed to write report")
        return result

    if inspect.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper