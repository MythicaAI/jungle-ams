import uuid
import time
import socket
import json
import os
from typing import Dict, List
import redis
from etcd3gw.client import Etcd3Client

def endpoint_parse(endpoint: str) -> tuple[str, int]:
    """Convert endpoint string to host, port"""
    host, port = endpoint.strip().split(':')
    return host, int(port)


class WorkerController:
    def __init__(self,
                 service_name: str,
                 etcd_endpoint: str,
                 redis_endpoint: str,
                 lease=None):
        self.service_name = service_name
        self.uuid = str(uuid.uuid4())
        self.host = socket.gethostname()
        self.pid = os.getpid()
        self.start_time = time.time()

        # ETCD client setup using etcd3gw
        etcd_host, etcd_port = endpoint_parse(etcd_endpoint)
        self.etcd = Etcd3Client(host=etcd_host, port=int(etcd_port))
        self.lease = lease  # Lease passed from the context manager
        self.etcd_key = f"/services/{self.service_name}/{self.uuid}"

        # Redis client setup
        redis_host, redis_port = endpoint_parse(redis_endpoint)
        self.redis = redis.Redis(host=redis_host, port=redis_port, db=0)

        # Fetch environment config from etcd
        self.environment_config = self.fetch_environment_config()

        # Register the service with ETCD
        self.register_service()

    def fetch_environment_config(self) -> Dict:
        """Fetch environment configuration from etcd."""
        config_key = "/environment/config"
        response = self.etcd.get(config_key)
        if response and response.get("kvs"):
            return json.loads(response["kvs"][0]["value"])
        return {}

    def register_service(self):
        metadata = {
            "host": self.host,
            "pid": self.pid,
            "uptime": self.get_uptime(),
            "service_name": self.service_name,
            "ports": self.get_exposed_ports(),  # Implement this method based on your service
            "version": "1.0.0",  # Replace with actual version info
            "environment_config": self.environment_config
        }
        self.etcd.put(self.etcd_key, json.dumps(metadata), lease=self.lease)

    def get_uptime(self) -> int:
        return int(time.time() - self.start_time)

    def get_exposed_ports(self) -> List[int]:
        # Implement this method to return the list of ports exposed by the service
        return [8080]  # Example port

    def renew_lease(self):
        self.lease.refresh()

    def get_metadata(self) -> Dict:
        response = self.etcd.get(self.etcd_key)
        for obj in response:
            return json.loads(obj)
        return {}

    def get_all_workers(self) -> List[Dict]:
        """Retrieve metadata for all worker controllers registered in etcd."""
        workers = []
        prefix = f"/services/{self.service_name}/"
        response = self.etcd.get_prefix(prefix)
        if response and response.get("kvs"):
            for kv in response["kvs"]:
                workers.append(json.loads(kv["value"]))
        return workers

    def cache_list(self, key: str, values: List[str]):
        self.redis.delete(key)
        self.redis.rpush(key, *values)

    def get_cached_list(self, key: str) -> List[str]:
        return self.redis.lrange(key, 0, -1)

    def cache_hash(self, key: str, data: Dict[str, str]):
        self.redis.hmset(key, data)

    def get_cached_hash(self, key: str) -> Dict[str, str]:
        return self.redis.hgetall(key)

    def close(self):
        self.redis.close()