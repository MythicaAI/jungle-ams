import argparse
import asyncio
import logging
import os
from contextlib import asynccontextmanager
from os import getcwd
from tempfile import TemporaryDirectory
from typing import Optional

import uvicorn
from fastapi import FastAPI, WebSocket
from pydantic.v1 import BaseSettings
from starlette.websockets import WebSocketState

from decoder_combiner import StreamContext, read_frames
from files import Cache, FileRef
from server.client import Client

log = logging.getLogger(__name__)

class Config(BaseSettings):
    cache_path: str = "cache"


@asynccontextmanager
async def lifespan(app: FastAPI):
    with TemporaryDirectory() as temp_dir:
        file = Cache()
    from server.server import Server
    server = Server(on_begin=)
    yield {
        'server': server
    }

def create_app(cache: Optional[str] = None):
    """Create the web socket application"""
    app = FastAPI(lifespan=lifespan)
    app.state.cache = cache or Config().cache_path
    return app


async def client_task(ws: WebSocket, client: Client):
    log.info("starting client_task")

    # process input frames, producing output frames
    # read all available bytes from client
    client.i.append_bytes(await ws.receive_bytes())

    # process the fully parsed frames and append any resulting frames to the output
    client.o.append_with(
        process_frames(client, read_frames(client.stream, client.i.read_frames())))

    # flush outgoing bytes from buffer to websocket
    async def flush_websocket(data: bytes):
        await client.ws.send_bytes(data)

await client.o.flush(flush_websocket)


@app.websocket("/ws")
async def connect(websocket: WebSocket):
    """Main connection endpoint to establish the unauthenticated websocket"""
    await websocket.accept()
    client = Client(server=app.state.server)
    while websocket.client_state == WebSocketState.CONNECTED:
        await client_task(websocket, client)


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="Run the FastAPI server.")
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="Host address to bind the server.")
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port number to bind the server.")
    parser.add_argument(
        "--cache",
        type=str,
        default=os.path.join(getcwd(), "cache"),
        help="Path to the cache directory.")
    return parser.parse_args()


def main():
    args = parse_args()
    app = create_app(args.cache)
    uvicorn.run(
        app,
        host=args.host,
        port=args.port,
        ws_ping_interval=5,
        ws_ping_timeout=5)


if __name__ == "__main__":
    main()
