from abc import abstractmethod

from streaming.models import StreamItem


class Stream:
    def __init__(self):
        self.buffer = []
        self.position = ''

    @abstractmethod
    def buffer_internal(self):
        pass

    @abstractmethod
    def dequeue(self, last_ack: str) -> [StreamItem]:
        pass
