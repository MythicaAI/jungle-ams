import argparse
import asyncio
import logging
import os
from contextlib import asynccontextmanager
from os import getcwd
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Optional

import uvicorn
from decoder_combiner import read_frames
from fastapi import APIRouter, FastAPI, WebSocket
from files import Cache
from pydantic.v1 import BaseSettings
from server.automation import on_begin
from server.client import Client
from server.process import process_frames
from server.server import Server
from starlette.websockets import WebSocketState

log = logging.getLogger(__name__)
router = APIRouter(prefix='/', tags=['websocket'])


class Config(BaseSettings):
    cache_path: str = "cache"


@asynccontextmanager
async def lifespan(app: FastAPI):
    with TemporaryDirectory() as temp_dir:
        files = Cache(Path(temp_dir))
        server = Server(on_begin=on_begin(), files=files)

        yield {
            'server': server
        }


def create_app(cache: Optional[str] = None):
    """Create the web socket application"""
    app = FastAPI(lifespan=lifespan)
    app.include_router(router)
    app.state.cache = cache or Config().cache_path
    return app


# Example method for using background tasks
async def send_periodic_updates(
        client: Client,
        interval: float = 5.0):
    """
    Send periodic updates to the client.

    This demonstrates using a background task that keeps running
    until the client disconnects.
    """
    while not client.closed:
        try:
            client.o.append_with(client.encoder.info("periodic update"))
            await asyncio.sleep(interval)
        except Exception as e:
            print(f"Error sending update to {client.unique_id}: {e}")
            break


async def client_service(ws: WebSocket, client: Client):
    # process input frames, producing output frames
    # read all available bytes from client
    client.i.append_bytes(await ws.receive_bytes())

    # process the fully parsed frames and append any resulting frames to the output
    client.o.append_with(
        process_frames(client, read_frames(client.stream, client.i.read_frames())))


async def client_task(websocket: WebSocket):
    await websocket.accept()
    client = Client(server=websocket.app.state.server)

    log.info(f"started client_task {client.unique_id}")
    while websocket.client_state == WebSocketState.CONNECTED:
        await client_service(websocket, client)

    # stop all client async work
    await client.stop()

    # flush outgoing bytes from client buffer to websocket
    async def flush_websocket(data: bytes):
        await websocket.send_bytes(data)

    await client.o.flush(flush_websocket)
    log.info(f"finished client_task {client.unique_id}")


@router.websocket("/ws")
async def connect(websocket: WebSocket):
    """Main connection endpoint to establish the unauthenticated websocket"""
    asyncio.create_task(client_task(websocket))


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
