import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import HTTPException, Request
import logging

logger = logging.getLogger(__name__)


class ExceptionLoggingMiddleware(BaseHTTPMiddleware):
    """
    A middleware that modifies catches the app's exceptions,
    logs it and reraise exceptions.
    """

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        try:
            response = await call_next(request)
            if response.status_code >= 400:
                logger.error(
                    "Error response",
                    extra={
                        "status_code": response.status_code,
                        "url": str(request.url),
                        "client": request.client.host,
                    },
                )
            return response
        except HTTPException as http_exc:
            logger.error(
                "HTTP Exception occurred",
                extra={
                    "status_code": http_exc.status_code,
                    "detail": http_exc.detail,
                    "url": str(request.url),
                    "client": request.client.host,
                },
            )
            raise http_exc
        except Exception as exc:
            logger.error(
                "Unhandled exception occurred",
                exc_info=True,
                extra={
                    "url": str(request.url),
                    "client": request.client.host,
                },
            )
            raise exc
        finally:
            duration = time.time() - start_time
            logger.info(
                "Request completed",
                extra={
                    "method": request.method,
                    "url": str(request.url),
                    "duration": duration,
                    "client": request.client.host,
                },
            )
