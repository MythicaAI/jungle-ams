import asyncio
from collections.abc import Callable
from pathlib import Path
from typing import Awaitable, Self

import uvicorn
from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketState

from encoder_cbor import BEGIN, END, HELLO, PING_PONG, encode_begin, encode_end, encode_error, encode_info, \
    encode_ping_pong
from files import Cache, FileRef
from net_buffer import NetBuffer


class ClientContext:
    def __init__(self, ws: WebSocket):
        self.ws = ws
        self.i = NetBuffer()
        self.o = NetBuffer()
        self.gen_stack: list[GeneratorContext] = []


class GeneratorContext:
    def __init__(
            self,
            fn: Callable[[Self], Awaitable[None]],
            base_path: Path):
        self.fn = fn
        self.args: dict[str, any]
        self.files = Cache(
            base_path=base_path,
            by_relative_path={},
            by_content_hash={})
        self.tasks: list[asyncio.Task] = []
        self.depth: int = 0


app = FastAPI()


async def gen_foo(ctx: GeneratorContext):
    yield encode_info("foo")


async def gen_bar(ctx: GeneratorContext):
    yield encode_info("bar")


async def begin_fetching(g: GeneratorContext, c: ClientContext, ref: FileRef):
    depth = g.depth + 1
    c.o.append_bytes(encode_begin("fetch", ref.content_hash, depth))
    c.o.append_bytes(encode_end(depth))


async def gen_precache(ctx: GeneratorContext):
    missing = []
    for k, v in ctx.args.items():
        if type(v) == FileRef:
            if not ctx.files.has_file_ref(v):
                missing.append(v)
    await asyncio.gather(*[begin_fetching(ctx, ref) for ref in missing])


GENERATORS = {
    'foo': gen_foo,
    'bar': gen_bar,
}


async def client_task(c: ClientContext):
    print("client_task")
    # read all available bytes from client
    c.i.append_bytes(await c.ws.receive_bytes())

    # process available frames
    for header, payload in c.i.read_frames():
        print(header.frame_type, header.payload_length, header.flags, payload)
        frame_type = header.frame_type
        if frame_type == HELLO:
            c.o.append_bytes(next(encode_ping_pong()))

        elif frame_type == PING_PONG:
            c.o.append_bytes(next(encode_ping_pong()))

        elif frame_type == BEGIN:
            if type(payload) != dict:
                print("from client:", payload)
                continue

            gen_name = payload.get('generator')
            if not gen_name:
                c.o.append_bytes(encode_error("missing generator name"))
                continue
            if gen_name not in GENERATORS:
                c.o.append_bytes(encode_error(f"no generator matching {gen_name}"))
                continue
            fn = GENERATORS[gen_name]
            c.gen_stack.append(GeneratorContext(**payload, fn=fn))

        elif frame_type == END:
            if not c.gen_stack:
                c.o.append_bytes(encode_error("no generator running"))
            gen = c.gen_stack.pop()
            await gen.fn(gen)

    async def flush_websocket(data: bytes):
        await c.ws.send_bytes(data)

    # flush outgoing bytes
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
