"""Readers API"""

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel

Direction = Literal["before", "after"]


class ReaderResponse(BaseModel):
    reader_id: str
    owner_id: str
    created: datetime
    source: str
    params: Optional[dict[str, Any]] = None
    name: Optional[str] = None
    position: Optional[str] = None
    direction: Optional[Direction] = "after"


class CreateReaderRequest(BaseModel):
    source: str
    params: Optional[dict[str, Any]] = None
    name: Optional[str] = None
    position: Optional[str] = None
    direction: Direction = "after"
