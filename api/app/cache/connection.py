import logging
from contextlib import asynccontextmanager, contextmanager

from redis.asyncio import ConnectionPool, StrictRedis

from config import app_config

log = logging.getLogger(__name__)
connection_pool = None


@asynccontextmanager
async def cache_connection_lifespan():
    """On startup create the redis connection pool"""
    global connection_pool
    pool = ConnectionPool(
        host=app_config().redis_host,
        port=app_config().redis_port,
        db=app_config().redis_db,
    )
    str_desc = f"host: {app_config().redis_host}:{app_config().redis_port}, db: {app_config().redis_db}"
    log.info("redis client initialized %s", str_desc)
    connection_pool = pool
    yield pool

    log.info("redis connection pool closing %s", str_desc)
    await pool.disconnect(False)
    log.info("redis connection pool closed %s", str_desc)


@contextmanager
def get_redis() -> StrictRedis:
    """Yields a strict redis accessor around the global connection pool"""
    global connection_pool
    redis = StrictRedis(connection_pool=connection_pool)
    yield redis
    redis.close()
