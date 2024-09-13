from pydantic import BaseModel, Field


class ClientOp(BaseModel):
    op: str


class ReadClientOp(ClientOp):
    op: str = Field(default="READ")
    after: str = Field(default=None)
    max_page: int = Field(default=1)

# extend with forward, rewind if needed
