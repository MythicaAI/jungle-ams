import logging

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.status import HTTP_400_BAD_REQUEST

from cryptid.cryptid import IdError, SequenceError

logger = logging.getLogger(__name__)


async def api_id_error(_: Request, exc: IdError):
    """Automatic IdError exception handler"""
    logger.warning("An invalid API identifier was used: %s", exc)
    return JSONResponse(
        status_code=HTTP_400_BAD_REQUEST,
        content={"detail": f"An invalid API identifier was used: {exc}"},
    )


async def api_seq_error(_: Request, exc: SequenceError):
    """Automatic SequenceError exception handler"""
    logger.warning("An invalid sequence was used: %s", exc)
    return JSONResponse(
        status_code=HTTP_400_BAD_REQUEST,
        content={"detail": f"An invalid sequence was used: {exc}"}
    )


async def validation_error(_: Request, exc: ValidationError):
    return JSONResponse(
        status_code=HTTP_400_BAD_REQUEST,
        content=exc.json()
    )


def register_exceptions(app):
    """Register all built-in exception handlers in this module"""
    app.add_exception_handler(IdError, api_id_error)
    app.add_exception_handler(SequenceError, api_seq_error)
    app.add_exception_handler(ValidationError, validation_error)
