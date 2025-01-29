import argparse

import web_server
from log_config import log_config
from worker_controller import WorkerController
import uvicorn
from worker_lease import WorkerLease

def main():
    # Parse command-line argument for etcd endpoint
    parser = argparse.ArgumentParser(description="Worker Controller Process")
    parser.add_argument(
        "--etcd",
        required=False,
        default='localhost:2379',
        help="Location of the etcd cluster")
    parser.add_argument(
        "--redis",
        required=False,
        default='localhost:6379',
        help="Location of the etcd cluster")
    args = parser.parse_args()

    log_config(log_level="DEBUG")

    # Acquire the lease
    with WorkerLease(args.etcd) as lease:
        # Initialize the worker controller
        controller = WorkerController(
            service_name="example_service",
            etcd_endpoint=args.etcd,
            redis_endpoint=args.redis,
            lease=lease)

        # Start the FastAPI server
        web_server.app.state.controller = controller
        uvicorn.run(
            web_server.app,
            host="0.0.0.0",
            port=8080)

if __name__ == "__main__":
    main()