from fastapi import FastAPI

from cache.connection import redis_connection_pool
from ripple.funcs import Boundary, Source


async def populate_list(app: FastAPI, key: str, source: Source):
    """
    Populate a list cache within redis from a streaming source
    """
    async with redis_connection_pool(app) as redis:
        after = None
        while True:
            boundary = Boundary(position=after)
            item_gen = source(boundary)
            page = [item async for item in item_gen]
            redis.rpush(key, page)
            if len(page) > 0:
                after = page[-1].get('index', None)
            else:
                after = None
