#!/bin/sh

set -eof pipefail

# shellcheck disable=SC2046
. $(poetry env info --path)/bin/activate

./print_ip_address.py

if [ "$1" == "packager" ]; then
  echo "running in packager mode"
  python3 packager.py \
    --endpoint=${MYTHICA_ENDPOINT} \
    --api_key=${MYTHICA_API_KEY} $*
  exit 0
fi

# Run DB migration to ensure database is at latest revision
alembic upgrade head

# Start Gunicorn, write logs to stdout for capture by container runtime
export PYTHONPATH=/ams/app

opentelemetry-instrument uvicorn main:app \
	--host ${HTTP_LISTEN_ADDR} \
	--port ${HTTP_LISTEN_PORT} \
	--workers ${WORKER_COUNT} \
	--proxy-headers
