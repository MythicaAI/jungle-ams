from asyncio import Task
from typing import Awaitable, Callable, Iterable, Type

from files import Cache
from net_buffer import NetBuffer
from server.client import Client

# Async work that is attached to an active process
AsyncSceneProcessor = Callable[[Type["ProcessContext"]], Awaitable[None]]


class ProcessContext:
    def __init__(
            self,
            *,
            files: Cache,
            commit=Callable[[Type["ProcessContext"], Client], Iterable[bytes]],
            rollback=Callable[[Type["ProcessContext"], Client], Iterable[bytes]]):
        self.attrs: dict[str, any]
        self.files = files
        self.tasks: list[Task] = []
        self.depth: int = 0
        self.i = NetBuffer()
        self.o = NetBuffer()
        self.commit = commit
        self.rollback = commit
