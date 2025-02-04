import json
import logging
import time

from fastapi import HTTPException, Request
from fastapi.concurrency import iterate_in_threadpool
from opentelemetry import trace
from opentelemetry.trace.status import Status, StatusCode
from starlette.middleware.base import BaseHTTPMiddleware
from ripple.runtime.decorators import propagate_telemetry_context
from opentelemetry.context import get_current as get_current_telemetry_context

logger = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)


class ExceptionLoggingMiddleware(BaseHTTPMiddleware):
    """
    A middleware that catches the app's exceptions,
    logs it, and re-raises exceptions.
    """
    @propagate_telemetry_context
    async def dispatch(self, request: Request, call_next):
        span = trace.get_current_span(context=get_current_telemetry_context())
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
            "body": body.decode('utf-8', errors='ignore') if body and request.url.path != '/v1/upload/store' else "",
            "start_time": start_time,
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

                logger.warning("Error response", extra=log_params)
            if response.status_code >= 500:
                logger.critical("Server error response", extra=log_params)
            return response
        except HTTPException as http_exc:
            log_params.update(
                {"status_code": http_exc.status_code, "detail": http_exc.detail}
            )
            logger.error("HTTP Exception occurred", extra=log_params)
            span.record_exception(http_exc)
            span.set_status(Status(StatusCode.ERROR, "HTTP Exception occurred"))
            raise http_exc
        except Exception as exc:
            logger.critical(
                "Unhandled exception occurred", exc_info=True, extra=log_params
            )
            span.record_exception(exc)
            span.set_status(Status(StatusCode.ERROR, "internal error"))
            raise exc
        finally:
            # Log the request duration
            duration = time.time() - start_time
            log_params.update({"duration": duration})
            logger.info("Request completed", extra=log_params)
