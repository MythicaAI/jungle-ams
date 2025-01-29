"""Take a lease for the worker identity"""
import logging

from etcd3gw.client import Etcd3Client

from worker_controller import endpoint_parse

log = logging.getLogger(__name__)

class WorkerLease:
    def __init__(self, etcd_endpoint: str, ttl: int = 60):
        self.etcd_endpoint = etcd_endpoint
        self.ttl = ttl
        self.etcd = None
        self.lease = None

    def __enter__(self):
        """Initialize the etcd client and acquire a lease"""
        log.debug("acquiring lease from %s", self.etcd_endpoint)
        host, port = endpoint_parse(self.etcd_endpoint)
        self.etcd = Etcd3Client(host=host, port=port)
        self.lease = self.etcd.lease(self.ttl)
        log.info("lease %s acquired from %s", self.lease.id, self.etcd_endpoint)
        return self.lease

    def __exit__(self, exc_type, exc_value, traceback):
        """Release the lease when exiting the context"""
        if self.lease:
            self.lease.revoke()