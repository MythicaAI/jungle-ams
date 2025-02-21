import argparse
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Iterator

import httpx
from httpx_ws import AsyncWebSocketSession, aconnect_ws

from encoder_cbor import encode_hello, encode_ping_pong
from frame_reader_usd import frame_reader_usd
from net_buffer import NetBuffer


async def stream_usd(ws, usd_file):
    for frame in frame_reader_usd(usd_file):
        print(f"sending {frame.hex()}")
        await ws.send_bytes(frame)


async def send(ws: AsyncWebSocketSession, stream: Iterator[bytes]):
    for data in stream:
        await ws.send_bytes(data)


async def ping_pong_task(ws: AsyncWebSocketSession):
    def now():
        return datetime.now(timezone.utc)

    while True:
        ping = encode_ping_pong()
        start_time = now()
        await ws.send_bytes(ping)
        try:
            await ws.receive_bytes(timeout=5)
        except TimeoutError:
            pass
        end_time = now()
        elapsed = end_time - start_time
        print("ping response:", elapsed)
        timeout = 1.0
        await asyncio.sleep(timeout)


async def connect_to_websocket(hostname: str, port: int, usd_file: str):
    buffer = NetBuffer()
    ping_interval = 30
    last_ping = datetime.now(timezone.utc) - timedelta(seconds=30)
    async with httpx.AsyncClient() as client:
        async with aconnect_ws(f"http://{hostname}:{port}/ws", client) as ws:
            # send hello
            await ws.send_bytes(encode_hello(client='example-client'))

            # start the background ping task
            # await client_ping_task.start_task(ws)

            # stream bytes and frames from the server
            while True:
                from httpx_ws import WebSocketDisconnect
                try:
                    buffer.append_bytes(await ws.receive_bytes(timeout=0.1))
                except TimeoutError:
                    pass
                except WebSocketDisconnect:
                    pass

                for header, payload in buffer.read_frames():
                    print('from server:', header.frame_type, header.payload_length, payload)
                    # TODO put debug decoder here, needs fixes

                # update ping
                now = datetime.now(timezone.utc)
                if now - last_ping > timedelta(seconds=ping_interval):
                    await ws.send_bytes(encode_ping_pong())
                    last_ping = now

                if usd_file:
                    await stream_usd(ws, usd_file)
                    usd_file = None


def parse_args():
    parser = argparse.ArgumentParser(description="WebSocket client to stream USD file.")
    parser.add_argument("--hostname", type=str, default='localhost', help="Server hostname")
    parser.add_argument("--port", type=int, default=8000, help="Server port")
    parser.add_argument("--usd-file", type=str, help="Path to the USD file")
    return parser.parse_args()


# Run the WebSocket connection
if __name__ == "__main__":
    args = parse_args()
    asyncio.run(connect_to_websocket(args.hostname, args.port, args.usd_file))
