import asyncio
from typing import Any, Callable

from files import FileRef
from server.client import Client
from server.process_context import ProcessContext


async def begin_fetching(client: Client, ref: FileRef):
    depth = client.depth + 1
    client.o.append_with(client.encoder.begin("fetch", ref.content_hash, depth))
    client.o.append_with(client.encoder.end(depth))


async def gen_precache(client: Client):
    missing = []
    for k, v in client.args.items():
        if type(v) == FileRef:
            if not client.files.has_file_ref(v):
                missing.append(v)
    await asyncio.gather(*[begin_fetching(client, ref) for ref in missing])


def gen_foo(client: Client, payload: Any) -> ProcessContext:
    def commit(context: ProcessContext):
        client.o.append_with(client.encoder.info(f"COMMIT foo: {payload}"))

    def rollback(context: ProcessContext):
        client.o.append_with(client.encoder.info(f"ROLLBACK foo: {payload}"))

    return ProcessContext(commit, rollback)


def gen_bar(client: Client, payload: Any) -> ProcessContext:
    client.o.append_with(client.encoder.info(f"bar: {payload}"))
    return ProcessContext()


# The process context factory receives the BEGIN payload and returns
# a process context over that content
ProcessContextFactory = Callable[[[Client], Any], ProcessContext]


def on_begin() -> dict[str, ProcessContextFactory]:
    """Get the mapping of actions to things that can start a context over that action"""
    return {
        'foo': gen_foo,
        'bar': gen_bar
    }
