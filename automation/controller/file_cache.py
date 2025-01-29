import redis

class Cache:
    """A class to handle caching of lists and sets into Redis."""

    def __init__(self, host='localhost', port=6379, db=0):
        """
        Initialize Redis connection pool.

        :param host: Hostname or IP address of the Redis server.
        :param port: Port of the Redis server.
        :param db: Redis database index to use.
        """
        self.redis = redis.StrictRedis(connection_pool=redis.ConnectionPool(host=host, port=port, db=db))

    def cache_list(self, key, data, expire=None):
        """
        Cache a list in Redis.

        :param key: The Redis key where the list will be stored.
        :param data: The list of values to be cached.
        :param expire: Optional expiration time for the cached list (in seconds).
        """
        if not isinstance(data, list):
            raise TypeError("The data must be a list.")
        self.redis.rpush(key, *data)
        if expire:
            self.redis.expire(key, expire)

    def cache_set(self, key, data, expire=None):
        """
        Cache a hash set in Redis.

        :param key: The Redis key where the hash set will be stored.
        :param data: The set or list of unique values to be cached.
        :param expire: Optional expiration time for the cached set (in seconds).
        """
        if not isinstance(data, (set, list)):
            raise TypeError("The data must be a set or a list.")
        self.redis.sadd(key, *data)
        if expire:
            self.redis.expire(key, expire)