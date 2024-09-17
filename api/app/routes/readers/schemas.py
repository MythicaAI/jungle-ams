"""Readers API"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ReaderResponse(BaseModel):
    reader_id: str
    owner_id: str
    created: datetime
    source: str
    params: Optional[dict[str, Any]] = None
    name: Optional[str] = None
    position: Optional[str] = None


class CreateReaderRequest(BaseModel):
    source: str
    params: Optional[dict[str, Any]] = None
    name: Optional[str] = None
    position: Optional[str] = None
