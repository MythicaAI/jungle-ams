import json
import logging
import time
from collections.abc import Mapping

from fastapi import HTTPException, Request, Response
from fastapi.concurrency import iterate_in_threadpool
from opentelemetry import trace
from opentelemetry.context import get_current as get_current_telemetry_context
from opentelemetry.trace.status import Status, StatusCode
from ripple.runtime.decorators import propagate_telemetry_context
from starlette.middleware.base import BaseHTTPMiddleware

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

        log_params = LazyLogParams(
            request,
            self._extract_body(request.headers.get("content-type", ""), body),
            start_time,
            self._sanitize_headers(dict(request.headers)),
        )

        try:
            response = await call_next(request)

            if response.status_code >= 400:
                if response.status_code >= 500:
                    logger.critical(
                        "Server error response status_code: %s",
                        response.status_code,
                        extra=log_params.get_dict(),
                    )
                else:
                    await self._resolve_response_code_400(log_params, response)
                    logger.warning(
                        "Error response %s",
                        log_params.get("response_body", ""),
                        extra=log_params.get_dict(),
                    )
            else:
                logger.info(
                    "Request completed %s",
                    request.url.path,
                    extra=log_params.get_dict(),
                )
            return response
        except HTTPException as exc:
            log_params.update(status_code=exc.status_code, detail=exc.detail)
            logger.error(
                "HTTP Exception occurred %s", exc.detail, extra=log_params.get_dict()
            )
            span.record_exception(exc)
            span.set_status(Status(StatusCode.ERROR, "HTTP Exception occurred"))
            raise exc
        except Exception as exc:
            logger.critical(
                "Unhandled exception occurred %s", str(exc), extra=log_params.get_dict()
            )
            span.record_exception(exc)
            span.set_status(Status(StatusCode.ERROR, "internal error"))
            raise exc

    async def _resolve_response_code_400(self, log_params, response: Response):
        log_params.update(status_code=response.status_code)
        resp_content_type = response.headers.get("content-type", "").lower()

        if not self._is_binary_content_type(resp_content_type):
            response_body = [chunk async for chunk in response.body_iterator]
            response.body_iterator = iterate_in_threadpool(iter(response_body))
            try:
                # In case the exception was not logged
                body_str = response_body[0].decode("utf-8")
                try:
                    log_params.update(response_body=str(json.loads(body_str)))
                except json.JSONDecodeError:
                    log_params.update(response_body=body_str)
            except UnicodeDecodeError:
                log_params.update(response_body="<Non-decodable body>")

    def _extract_body(self, content_type, body):

        if self._is_binary_content_type(content_type):
            return "[truncated]"
        return body.decode('utf-8', errors='ignore') if body else ""

    def _sanitize_headers(self, headers: dict):
        if headers.get("authorization"):
            headers["authorization"] = "__hidden__"
        return str(headers)

    def _is_binary_content_type(self, content_type):
        return any(
            ctype in content_type
            for ctype in {
                "multipart/form-data",
                "application/octet-stream",
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/zip",
                "application/x-tar",
                "application/gzip",
                "application/x-bzip2",
                "application/x-7z-compressed",
                "application/x-rar-compressed",
                "application/x-msdownload",
                "application/x-sh",
                "application/x-dosexec",
                "image/",  # Matches all image types (e.g., image/png, image/jpeg)
                "video/",  # Matches all video types (e.g., video/mp4, video/webm)
                "audio/",  # Matches all audio types (e.g., audio/mpeg, audio/ogg)
                "font/",  # Matches font files (e.g., font/woff, font/woff2)
            }
        )


class LazyLogParams(Mapping):
    def __init__(self, request: Request, body, start_time, headers):
        self._start_time = start_time
        self._params = {
            "url": str(request.url),
            "client": request.client.host,
            "method": request.method,
            "headers": headers,
            "body": body,
        }

    def __getitem__(self, key):
        return self._params.get(key)

    def __iter__(self):
        return iter(self._params.keys())

    def __len__(self):
        return len(self._params)

    def update(self, **kwargs):
        self._params.update(kwargs)

    def get_dict(self):
        """Returns a snapshot of the dictionary with updated duration"""
        snapshot = self._params.copy()
        snapshot["duration"] = time.time() - self._start_time
        return snapshot

    def __contains__(self, key):
        return key in self._params
