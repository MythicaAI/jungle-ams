from typing import Literal

from pydantic import BaseModel, Field


class ClientOp(BaseModel):
    op: str


class ReadClientOp(ClientOp):
    op: str = Field(default="READ")
    position: str = Field(default=None)
    direction: Literal['before', 'after'] = Field(default="after")

# extend with forward, rewind if needed
