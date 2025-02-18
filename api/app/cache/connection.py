# global usage is not understood by pylint
# pylint: disable=global-statement,global-variable-not-assigned
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from redis.asyncio import ConnectionPool, StrictRedis

from config import app_config

log = logging.getLogger(__name__)


@asynccontextmanager
async def cache_connection_lifespan(app: FastAPI):
    """On startup create the redis connection pool"""
    pool = ConnectionPool(
        host=app_config().redis_host,
        port=app_config().redis_port,
        db=app_config().redis_db,
    )
    str_desc = f"host: {app_config().redis_host}:{app_config().redis_port}, db: {app_config().redis_db}"
    log.info("redis client initialized %s", str_desc)
    try:
        app.state.redis_pool = pool
        yield pool
    except GeneratorExit:
        pass
    finally:
        log.debug("redis connection pool closing %s", str_desc)
        del app.state.redis_pool
        await pool.disconnect(False)
        log.info("redis connection pool closed %s", str_desc)


@asynccontextmanager
async def redis_connection_pool(app: FastAPI) -> StrictRedis:
    """Yields a strict redis accessor around the global connection pool"""
    redis_pool = app.state.redis_pool
    if redis_pool is None:
        raise ValueError("cache pool is not available")
    conn = StrictRedis(connection_pool=redis_pool)
    yield conn
    await conn.close()


async def get_redis(request: Request) -> AsyncGenerator[StrictRedis, None]:
    """Fast API Depends() compatible AsyncExit construction of the redis connection, uses
    async context manager to handle session state cleanup"""
    async with redis_connection_pool(request.app) as redis:
        yield redis
