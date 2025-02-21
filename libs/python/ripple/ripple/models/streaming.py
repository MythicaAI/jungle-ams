from datetime import datetime
from typing import Annotated, Any, Literal, Optional, Union
from uuid import uuid4

from pydantic import BaseModel, Field
from ripple.models.assets import AssetVersionEntryPointReference
from ripple.models.params import ParameterSpec


class StreamItem(BaseModel):
    """
    The base for items in a stream

    Items MUST have an item_type as a discriminator
    If a stream is seekable, it MUST have index
    """
    item_type: str
    index: Optional[str] = None
    correlation: str = Field(default_factory=lambda: str(uuid4()))


class ProcessStreamItem(StreamItem):
    """
    Process stream items are produced by a running process, they
    MUST have a process GUID for debugging purposes and MUST have
    a job_id to identify their job context bound
    """
    process_guid: str = ""
    job_id: str = ""


class Progress(ProcessStreamItem):
    """
    Indication of overall process progress for long-running processes
    where some user progress indication may be desired.
    """
    item_type: Literal["progress"] = "progress"
    progress: int


class Message(ProcessStreamItem):
    """
    Non-localized message for processes to communicate process - for
    debugging purposes.
    """
    item_type: Literal["message"] = "message"
    message: str


class Error(ProcessStreamItem):
    """
    Non-localized message for processes to communicate process - for
    debugging purposes.
    """
    item_type: Literal["error"] = "error"
    error: str


class OutputFiles(ProcessStreamItem):
    """
    A file output event for generated files, the outputs are keyed
    with a param name.
    """
    item_type: Literal["file"] = "file"
    files: dict[str, list[str]]  # "inputs": ["file_id", "file_id"]


class FileContentChunk(ProcessStreamItem):
    """
    A chunk of a file's content encoded as a base64 string.
    Key and index are used to associate the chunk with a specific OutputFiles file.
    """
    item_type: Literal["file_content_chunk"] = "file_content_chunk"
    file_key: str
    file_index: int
    chunk_index: int
    total_chunks: int
    file_size: int
    encoded_data: str


class JobDefinition(ProcessStreamItem):
    """
    A job definition to be registered into the job definitions table.
    """
    item_type: Literal["job_def"] = "job_def"
    job_def_id: str = ""
    job_type: str
    name: str
    description: str
    parameter_spec: ParameterSpec
    owner_id: Optional[str] = None
    source: Optional[AssetVersionEntryPointReference] = None


class Event(StreamItem):
    """
    An event from the events table with the payload. These events
    are indexed by the event_id
    """
    item_type: Literal["event"] = "event"
    payload: dict[str, Any] = Field(default_factory=dict)
    event_type: Optional[str] = None
    queued: Optional[datetime] = None
    acked: Optional[datetime] = None
    completed: Optional[datetime] = None


class CropImageResponse(OutputFiles):
    files: dict[str, list[str]] = Field(default={"cropped_image": []})


# Build the set of models for verification
StreamModelTypes = {Progress, Message, OutputFiles, Event, FileContentChunk}

# Define a Union type with a discriminator for proper serialization
StreamItemUnion = Annotated[
    Union[Progress, Message, OutputFiles, Event, FileContentChunk],
    Field(discriminator='item_type')
]
