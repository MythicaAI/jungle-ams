import logging

from fastapi import Request
from fastapi.responses import JSONResponse
from opentelemetry import trace
from pydantic import ValidationError
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR

from cryptid.cryptid import IdError, SequenceError
from ripple.auth.authorization import RoleError

logger = logging.getLogger(__name__)


async def api_id_error(_: Request, exc: IdError):
    """Automatic IdError exception handler"""
    return JSONResponse(
        status_code=HTTP_400_BAD_REQUEST,
        content={"detail": f"An invalid API identifier was used: {exc}"},
    )


async def api_seq_error(_: Request, exc: SequenceError):
    """Automatic SequenceError exception handler"""
    return JSONResponse(
        status_code=HTTP_400_BAD_REQUEST,
        content={"detail": f"An invalid sequence was used: {exc}"}
    )


async def validation_error(_: Request, exc: ValidationError):
    return JSONResponse(
        status_code=HTTP_400_BAD_REQUEST,
        content=exc.json()
    )


async def role_error(_: Request, exc: RoleError):
    return JSONResponse(
        status_code=HTTP_401_UNAUTHORIZED,
        content={'detail': exc.message}
    )


async def other_errors(_: Request, exc: Exception):
    span = trace.get_current_span()
    span.record_exception(exc)
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected error occurred: {type(exc).__name__}"}
    )


def register_exceptions(app):
    """Register all built-in exception handlers in this module"""
    app.add_exception_handler(IdError, api_id_error)
    app.add_exception_handler(SequenceError, api_seq_error)
    app.add_exception_handler(ValidationError, validation_error)
    app.add_exception_handler(RoleError, role_error)
    app.add_exception_handler(Exception, other_errors)
