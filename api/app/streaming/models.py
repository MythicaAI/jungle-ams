from pydantic import BaseModel


class StreamItem(BaseModel):
    typ: str
    correlation: str


class Progress(StreamItem):
    progress: int


class Message(StreamItem):
    message: str


class File(StreamItem):
    file_id: str


class Event(StreamItem):
    event_id: str
    payload: dict
