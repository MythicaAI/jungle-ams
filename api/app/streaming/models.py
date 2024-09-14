from typing import Annotated, Any, Literal, Union
from uuid import uuid4

from pydantic import BaseModel, Field


class StreamItem(BaseModel):
    item_type: str
    correlation: str = Field(default_factory=lambda: str(uuid4()))


class ProcessStreamItem(StreamItem):
    process_guid: str
    job_id: str


class Progress(ProcessStreamItem):
    item_type: Literal["progress"] = "progress"
    progress: int


class Message(ProcessStreamItem):
    item_type: Literal["message"] = "message"
    message: str


class OutputFiles(ProcessStreamItem):
    item_type: Literal["file"] = "file"
    files: dict[str, list[str]]  # "inputs": ["file_id", "file_id"]


class Event(StreamItem):
    item_type: Literal["event"] = "event"
    event_id: str
    payload: dict[str, Any] = Field(default_factory=dict)


# Build the set of models for verification
StreamModelTypes = {Progress, Message, OutputFiles, Event}

# Define a Union type with a discriminator for proper serialization
StreamItemUnion = Annotated[
    Union[Progress, Message, OutputFiles, Event],
    Field(discriminator='item_type')
]
