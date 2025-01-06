import json
import time
from fastapi.concurrency import iterate_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import HTTPException, Request
import logging

from opentelemetry import trace
from opentelemetry.trace.status import Status, StatusCode
from opentelemetry.metrics import get_meter_provider
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator


logger = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)
meter = get_meter_provider().get_meter(__name__)
counter = meter.create_counter("request-count")
histogram = meter.create_histogram("request-latency")
gauge_histogram = meter.create_gauge("request-gauge-latency")


def propagate_context(func):
    def wrapper(*args, **kwargs):
        request: Request = args[1]
        context = TraceContextTextMapPropagator().extract(carrier=dict(request.headers))
        with tracer.start_as_current_span("request", context=context):
            result = func(*args, **kwargs)
        return result
    return wrapper


class ExceptionLoggingMiddleware(BaseHTTPMiddleware):
    """
    A middleware that catches the app's exceptions,
    logs it, and re-raises exceptions.
    """
    @propagate_context
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        span = trace.get_current_span()

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
            histogram.record(duration, log_params)
            gauge_histogram.set(duration, log_params)
            logger.info("Request completed", extra=log_params)
            counter.add(1, {"name": str(request.url), **log_params, "duration": duration})
