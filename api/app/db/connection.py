# global usage is not understood by pylint
# pylint: disable=global-statement,global-variable-not-assigned
# cursor() method is dynamic
# pylint: disable=no-member

import logging
from contextlib import asynccontextmanager
from zoneinfo import ZoneInfo

from sqlmodel import Session, create_engine
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

from config import app_config

from alembic.config import Config, command

engine = None

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
    global engine

    engine_url = app_config().sql_url.strip()
    engine = create_engine(engine_url)
    conn = engine.connect()
    if app_config().telemetry_enable:
        SQLAlchemyInstrumentor().instrument(engine=engine)  

    # Setup fallbacks for features that exist in postgres but not sqlite
    if engine.dialect.name == "sqlite":
        cursor = engine.raw_connection().cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS app_sequences (seq INTEGER DEFAULT 1, name TEXT PRIMARY KEY);")
        cursor.close()
        log.info("sqlite fallbacks installed")
        run_sqlite_migrations()


    log.info("database engine connected %s, %s", engine.name, engine.dialect.name)
    try:
        yield engine
    except GeneratorExit:
        pass
    finally:
        conn.close()
        log.info("database engine disconnected %s", engine.name)
        engine.dispose()
        engine = None


def get_session(echo=False):
    """Get a database session using the main database connection"""
    global engine

    engine.echo = echo
    return Session(engine)
