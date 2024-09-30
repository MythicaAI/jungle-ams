from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.status import HTTP_400_BAD_REQUEST

from cryptid.cryptid import IdError, SequenceError


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


def register_exceptions(app):
    """Register all built-in exception handlers in this module"""
    app.add_exception_handler(IdError, api_id_error)
    app.add_exception_handler(SequenceError, api_seq_error)
