import asyncio
from collections.abc import Callable
from pathlib import Path
from typing import Any, Awaitable, Iterator, Self

import uvicorn
from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketState

from encoder_cbor import BEGIN, END, HELLO, PARTIAL, PING_PONG, encode_begin, encode_end, encode_error, encode_info, \
    encode_ping_pong
from files import Cache, FileRef
from net_buffer import FrameHeader, NetBuffer

AsyncSceneProcessor = Callable[[Self], Awaitable[None]]


class ProcessContext:
    def __init__(self, base_path: Path, depth: int = 0):
        self.args: dict[str, any]
        self.files = Cache(
            base_path=base_path,
            by_relative_path={},
            by_content_hash={})
        self.tasks: list[asyncio.Task] = []
        self.depth: int = 0
        self.i = NetBuffer()
        self.o = NetBuffer()


class StreamContext:
    def __init__(self, base_path: Path):
        self.stream_id = 0
        self.seq = 0
        self.streams: dict[int, list[tuple[int, bytes]]] = {}
        self.stack: list[ProcessContext] = []
        self.processors: dict[str, AsyncSceneProcessor] = {}
        self.base_path = base_path
        self.depth = 0


class ClientContext:
    def __init__(self, ws: WebSocket, base_path: Path):
        self.ws = ws
        self.i = NetBuffer()
        self.o = NetBuffer()
        self.stream_context = StreamContext(base_path)
        self.files: Cache = Cache(
            base_path=base_path,
            by_relative_path={},
            by_content_hash={})


app = FastAPI()


async def gen_foo(c: ProcessContext):
    c.o.append_with(encode_info("foo"))


async def gen_bar(c: ProcessContext):
    c.o.append_with(encode_info("bar"))


async def begin_fetching(c: ProcessContext, ref: FileRef):
    depth = c.depth + 1
    c.o.append_with(encode_begin("fetch", ref.content_hash, depth))
    c.o.append_with(encode_end(depth))


async def gen_precache(ctx: ProcessContext):
    missing = []
    for k, v in ctx.args.items():
        if type(v) == FileRef:
            if not ctx.files.has_file_ref(v):
                missing.append(v)
    await asyncio.gather(*[begin_fetching(ctx, ref) for ref in missing])


def process_generate(c: StreamContext, payload: dict) -> Iterator[bytes]:
    name = payload.get('process')
    if not name:
        yield from encode_error("missing process name")
        return
    gen = c.processors.get(name)
    if gen is None:
        yield from encode_error(f"no process matching {name}")
        return

    c.depth = c.depth + 1
    process_context = ProcessContext(base_path=c.base_path, depth=c.depth)
    c.stack.append(process_context)


def process_generate_end(c: StreamContext, payload: dict) -> Iterator[bytes]:
    """Process a END frame

    After a BEGIN ATTRIB/FILE . END the processor stack can be evaluated - it
    may be that some fetches are still in process from the block. Allow
    the stream context to finish all fetches that were part of the context before
    begninng the processor.
    """
    g = c.stack[-1]
    g.depth = 0
    g.tasks = []
    g.files.clear()
    g.args = payload.get('args', {})
    g.tasks.append(asyncio.create_task(g.fn(g)))
    c.stack.pop()
    c.depth = c.depth - 1
    assert c.depth >= 0
    yield from encode_info("generator end")


def process_file(c: ClientContext, payload: dict) -> Iterator[bytes]:
    """Process a begin fetch"""
    file_ref = FileRef(**payload)
    if not file_ref.content_hash:
        yield from encode_error(f"FileRef {payload} missing content_hash")
        return
    if not file_ref.relative_path:
        yield from encode_error(f"FileRef {payload} missing relative_path")
        return

    # if status == 'fetch':
    # if the file is cached locally return it
    # file_ref = c.files.by_content_hash.get(file_ref.content_hash)
    # if not file_ref:
    # yield from encode_file(file_ref, status='missing')
    # return
    # yield from encode_file(file_ref)
    # for c.files.by_relative_path[file_ref.relative_path] = file_ref
    # yield from encode_file()


def process_begin(c: ClientContext, payload: dict) -> Iterator[bytes]:
    """Process a BEGIN frame"""
    if type(payload) != dict:
        print("process_generate: from client:", payload)

    c.stream_context.generators = {
        'foo': gen_foo,
        'bar': gen_bar,
    }

    if 'generate' in payload:
        yield from process_generate(c.stream_context, payload)


def process_frames(
        c: StreamContext,
        frame_reader: Iterator[tuple[FrameHeader, Any]]) -> Iterator[bytes]:
    """
    Given a stream context and an iterate that produces new header, payload tuples
    generate a stream of output responses
    """

    def add_stream_partial(partial_payload: bytes):
        """Add a stream partial using the last sequence partial of the client context"""
        c.streams.setdefault(c.stream_id, []).append((c.seq, partial_payload))

    def collapse_stream() -> bytearray:
        """Collapse a stream of partials into a single byte array"""
        buffer = bytearray()
        last_seq = 0
        partials = c.streams.get(c.stream_id, [])
        for seq, payload in partials:
            if seq == 0:
                last_seq = 0
            else:
                assert c.seq == last_seq + 1
                last_seq = c.seq
            buffer.extend(payload)
        del c.streams[c.stream_id]
        c.stream_id = 0
        c.seq = 0
        return buffer

    # process available frames, yielding data to send
    for header, payload in frame_reader:
        print(header.frame_type, header.payload_length, header.flags, payload)
        frame_type = header.frame_type
        if frame_type == HELLO:
            yield from encode_ping_pong()

        elif frame_type == PING_PONG:
            yield from encode_ping_pong()

        elif frame_type == PARTIAL:
            c.stream_id = int(payload['id'])
            c.seq = int(payload['seq'])
        elif frame_type == BEGIN:
            if header.partial:
                if c.seq > 0:
                    add_stream_partial(payload)
                    print(f"received partial payload: {len(payload)} bytes")
                    continue
                else:
                    import cbor2
                    payload = cbor2.loads(memoryview(collapse_stream()))
                    yield from process_begin(c, payload)

        elif frame_type == END:
            if not c.stack:
                yield from encode_error("no generator running")
            else:
                yield from process_generate_end(c, payload)


async def client_task(c: ClientContext):
    print("client_task")
    # read all available bytes from client
    c.i.append_bytes(await c.ws.receive_bytes())

    # process input frames, producing output frames
    for frame in process_frames(c.stream_context, c.i.read_frames()):
        c.o.append_bytes(frame)

    # flush outgoing bytes from buffer to websocket
    async def flush_websocket(data: bytes):
        await c.ws.send_bytes(data)

    await c.o.flush(flush_websocket)


@app.websocket("/ws")
async def connect(websocket: WebSocket):
    await websocket.accept()
    client = ClientContext(ws=websocket)
    while websocket.client_state == WebSocketState.CONNECTED:
        await client_task(client)


def main():
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        ws_ping_interval=5,
        ws_ping_timeout=5)


if __name__ == "__main__":
    main()
