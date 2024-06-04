from typing import Any

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error: str


class ScalarResponse(BaseModel):
    message: str = "ok"
    result: Any


class ListResponse(BaseModel):
    message: str = "ok"
    results: list[Any]
