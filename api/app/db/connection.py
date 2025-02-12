# global usage is not understood by pylint
# pylint: disable=global-statement,global-variable-not-assigned
# cursor() method is dynamic
# pylint: disable=no-member

import logging
from contextlib import asynccontextmanager
from zoneinfo import ZoneInfo

from alembic.config import Config, command
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession

from config import app_config
from ripple.config import ripple_config

engine = None
create_new_session = None

log = logging.getLogger(__name__)

#
# The database by default should be configured for UTC, however for the case where
# a local SQLite database is automatically generating timestamps they will be in the
# timezone of the local machine as per the SQLite implementation. Timestamps coming
# of the database should be normalized to UTC before they are delivered to any clients
# of the API.
#
TZ = ZoneInfo(app_config().db_timezone)


def run_sqlite_migrations():
    """Run the alembic migration"""
    try:
        # Configure Alembic to use the 'alembic_sqlite' section
        alembic_cfg = Config("alembic.ini", ini_section='sqlite')
        alembic_cfg.set_main_option('sqlalchemy.url', app_config().sql_url)

        # Run migrations
        command.upgrade(alembic_cfg, "head")

        log.info("alembic head migration finished")
    except Exception as e:
        logging.error("migration failed: %s", e)
        raise e


@asynccontextmanager
async def db_connection_lifespan():
    """Lifecycle management of the database connection"""
    global create_new_session, engine

    engine_url = app_config().sql_url.strip()

    engine = create_async_engine(engine_url, echo=True, future=True)
    create_new_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    # test creating a new session
    session = create_new_session()

    # instrument the engine for telemetry
    if app_config().telemetry_enable:
        SQLAlchemyInstrumentor().instrument(engine=engine)

    log.info("database engine %s, driver: %s", engine.dialect.name, engine.dialect.driver)

    # Setup fallbacks for features that exist in postgres but not sqlite
    if engine.dialect.name == "sqlite":
        raw_conn = await engine.raw_connection()
        try:
            cursor = raw_conn.cursor()
            cursor.execute("CREATE TABLE IF NOT EXISTS app_sequences (seq INTEGER DEFAULT 1, name TEXT PRIMARY KEY);")
            cursor.close()
            log.info("sqlite fallbacks installed")
            run_sqlite_migrations()
        finally:
            raw_conn.close()

    try:
        yield engine
    except GeneratorExit:
        pass
    finally:
        session.close()
        log.info("database engine disconnected %s", engine.name)
        session.dispose()
        engine = None


async def get_session() -> AsyncSession:
    """Get a database session using the main database connection"""
    global engine, create_new_session
    if engine is not None:
        return create_new_session()
    raise OperationalError("engine is not available", None, None)


def sql_profiler_decorator(func, report_name="report.html"):
    "Focusing on the SQL profiling aspect"
    import sqltap
    def wrapper(*args, **kwargs):
        if not ripple_config().mythica_environment == "debug":
            return func(*args, **kwargs)
        try:
            profiler = sqltap.start()
            result = func(*args, **kwargs)
            statistics = profiler.collect()
            sqltap.report(statistics, report_name)
        except PermissionError:
            result = func(*args, **kwargs)
        return result

    return wrapper
