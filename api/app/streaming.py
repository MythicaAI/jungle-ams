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
    payload: str


class Stream:
    def __init__(self):
        self.buffer = []
        self.position = ''

    def buffer_internal(self):
        pass

    def dequeue(self, last_ack: str) -> [StreamItem]:
        pass


class Source:
    def __init__(self):
        pass

    def dequeue(self, last_ack: str) -> [StreamItem]:
        pass


class Sink:
    def __init__(self):
        pass

    def write(self, item: StreamItem) -> bool:
        pass
