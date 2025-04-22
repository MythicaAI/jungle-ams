#!/bin/sh

set -eof pipefail

# shellcheck disable=SC2046
. $(poetry env info --path)/bin/activate

./print_ip_address.py

# Run DB migration to ensure database is at latest revision
alembic upgrade head

# Start Gunicorn, write logs to stdout for capture by container runtime
export PYTHONPATH=/ams/app

opentelemetry-instrument uvicorn main:app \
	--host ${HTTP_LISTEN_ADDR} \
	--port ${HTTP_LISTEN_PORT} \
	--workers ${WORKER_COUNT} \
	--proxy-headers
