import logging
from contextlib import asynccontextmanager
from zoneinfo import ZoneInfo

from sqlalchemy import event
from sqlmodel import Session, create_engine

from config import app_config

engine_url = app_config().sql_url.strip()
engine = create_engine(engine_url)

log = logging.getLogger(__name__)

#
# The database by default should be configured for UTC, however for the case where
# a local SQLite database is automatically generating timestamps they will be in the
# timezone of the local machine as per the SQLite implementation. Timestamps coming
# of the database should be normalized to UTC before they are delivered to any clients
# of the API.
#
TZ = ZoneInfo(app_config().db_timezone)

#
# Fallbacks for SQLite databases
#
if engine.dialect.name == "sqlite":
    @event.listens_for(engine, "connect")
    def setup_sqlite_fallbacks(dbapi_connection, _):
        """Setup fallbacks for features that exist in postgres but not sqlite"""
        cursor = dbapi_connection.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS app_sequences (seq INTEGER DEFAULT 1, name TEXT PRIMARY KEY);")
        cursor.close()

        log.info("sqlite fallbacks installed")


@asynccontextmanager
async def db_connection_lifespan():
    """Lifecycle management of the database connection"""
    conn = engine.connect()
    log.info("database engine connected %s, %s", engine.name, engine.dialect.name)
    yield engine
    conn.close()
    log.info("database engine disconnected %s", engine.name)


def get_session(echo=False):
    """Get a database session using the main database connection"""
    engine.echo = echo
    return Session(engine)
