Mythica API application
=====

See the (API docs)[http://localhost] for more information

Running:

```bash
fastapi run main.py \
	--host ${HTTP_LISTEN_ADDR} \
	--port ${HTTP_LISTEN_PORT} \
	--workers ${WORKER_COUNT} \
	--proxy-headers
```
