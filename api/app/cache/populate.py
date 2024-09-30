from cache.connection import get_redis
from streaming.funcs import Source


def populate_list(key: str, source: Source):
    """
    Populate a list cache within redis from a streaming source
    """
    with (get_redis() as redis):
        after = None
        page_size = 10
        while True:
            page = source(after, page_size)
            if len(page) == 0:
                break
            redis.rpush(key, page)
            after = page[-1].get('index', None)
