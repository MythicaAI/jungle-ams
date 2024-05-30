#!/bin/sh

# Env config and defaults
HTTP_LISTEN_ADDR=${HTTP_LISTEN_ADDR:-0.0.0.0}
HTTP_LISTEN_PORT=${HTTP_LISTEN_PORT:-5555}
GUNICORN_WORKER_COUNT=${GUNICORN_WORKER_COUNT:-3}

set -eof pipefail

./print_ip_address.py

# Run DB migration to ensure database is at latest revision
alembic upgrade head

# Start Gunicorn, write logs to stdout for capture by container runtime
gunicorn \
	--access-logfile - \
	--bind "${HTTP_LISTEN_ADDR}:${HTTP_LISTEN_PORT}" \
	--workers ${GUNICORN_WORKER_COUNT} \
	app:app
