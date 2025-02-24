from asyncio import Task
from pathlib import Path
from typing import Awaitable, Callable, Type

from files import Cache
from net_buffer import NetBuffer

AsyncSceneProcessor = Callable[[Type["ProcessContext"]], Awaitable[None]]


class ProcessContext:
    def __init__(self, base_path: Path, depth: int = 0):
        self.args: dict[str, any]
        self.files = Cache(
            base_path=base_path,
            by_relative_path={},
            by_content_hash={})
        self.tasks: list[Task] = []
        self.depth: int = 0
        self.i = NetBuffer()
        self.o = NetBuffer()
        self.stack: list[ProcessContext] = []
        self.processors: dict[str, AsyncSceneProcessor] = {}

    def register_processor(self, name: str, processor: AsyncSceneProcessor):
        self.processors[name] = processor
