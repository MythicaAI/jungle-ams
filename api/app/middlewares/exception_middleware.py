import json
import time
from fastapi.concurrency import iterate_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import HTTPException, Request
import logging

logger = logging.getLogger(__name__)


class ExceptionLoggingMiddleware(BaseHTTPMiddleware):
    """
    A middleware that catches the app's exceptions,
    logs it, and re-raises exceptions.
    """

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        body = await request.body()
        headers = dict(request.headers)
        if headers.get("authorization"):
            headers["authorization"] = "__hidden__"

        log_params = {
            "url": str(request.url),
            "client": request.client.host,
            "method": request.method,
            "headers": str(headers),
            "body": body.decode('utf-8', errors='ignore') if body else "",
        }

        try:
            response = await call_next(request)

            if response.status_code >= 400:
                log_params.update({"status_code": response.status_code})

                response_body = [chunk async for chunk in response.body_iterator]
                response.body_iterator = iterate_in_threadpool(iter(response_body))
                try:
                    # In case the exception was not logged
                    body_str = response_body[0].decode("utf-8")
                    try:
                        log_params["response_body"] = str(json.loads(body_str))
                    except json.JSONDecodeError:
                        log_params["response_body"] = body_str
                except UnicodeDecodeError:
                    log_params["response_body"] = "<Non-decodable body>"

                logger.error("Error response", extra=log_params)

            return response
        except HTTPException as http_exc:
            log_params.update(
                {"status_code": http_exc.status_code, "detail": http_exc.detail}
            )
            logger.error("HTTP Exception occurred", extra=log_params)
            raise http_exc
        except Exception as exc:
            logger.error(
                "Unhandled exception occurred", exc_info=True, extra=log_params
            )
            raise exc
        finally:
            # Log the request duration
            duration = time.time() - start_time
            log_params.update({"duration": duration})
            logger.info("Request completed", extra=log_params)
