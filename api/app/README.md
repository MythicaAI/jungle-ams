Mythica API application
=====

FastAPI application for serving up the Mythica package index and 
operations on backend.

See the (API docs)[http://localhost:8080/docs] for more information

Running:

```bash
fastapi run main.py \
	--host ${HTTP_LISTEN_ADDR} \
	--port ${HTTP_LISTEN_PORT} \
	--workers ${WORKER_COUNT} \
	--proxy-headers
```
