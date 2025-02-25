from asyncio import Task
from typing import Any, Awaitable, Callable, Type

from files import Cache
from net_buffer import NetBuffer
from server.client import Client


class ProcessContext:
    def __init__(self, files: Cache):
        self.attrs: dict[str, any]
        self.files = files
        self.tasks: list[Task] = []
        self.depth: int = 0
        self.i = NetBuffer()
        self.o = NetBuffer()


async def begin_fetching(client: Client, ref: FileRef):
    depth = c.depth + 1
    c.o.append_with(client.encoder.begin("fetch", ref.content_hash, depth))
    c.o.append_with(client.encoder.end(depth))


async def gen_precache(client: Client):
    missing = []
    for k, v in ctx.args.items():
        if type(v) == FileRef:
            if not ctx.files.has_file_ref(v):
                missing.append(v)
    await asyncio.gather(*[begin_fetching(client, ref) for ref in missing])


# Async work that is attached to an active process
AsyncSceneProcessor = Callable[[Type["ProcessContext"]], Awaitable[None]]

# The process context factory receives the BEGIN payload and returns
# a process context over that content
ProcessContextFactory = Callable[[Client, Any], ProcessContext]


def gen_foo(client: Client) -> ProcessContext:
    client.o.append_with(client.encoder.info("foo"))
    return ProcessContext()


def gen_bar(client: Client) -> ProcessContext:
    client.o.append_with(client.encoder.info("bar"))
    return ProcessContext()


def process_on_begin() -> dict[str, ProcessContextFactory]:
    return {
        'foo': gen_foo,
        'bar': gen_bar
    }
