#!/bin/sh

# shellcheck disable=SC2046
. $(poetry env info --path)/bin/activate

# Check for the argument to determine the mode
if [ "$1" = "initialize" ]; then
    # Run one-off initialization
    python3 main.py initialize
else
    # Start the main FastAPI app with Uvicorn
	export PYTHONPATH=/app
	fastapi run main.py \
		--host ${HTTP_LISTEN_ADDR} \
		--port ${HTTP_LISTEN_PORT} \
		--workers ${WORKER_COUNT} \
		--proxy-headers

fi
 