import argparse
import asyncio
import json
import logging
import os
import websocket
from typing import Any
import random

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s.%(msecs)03d %(name)s(%(process)d): %(levelname)s: %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger("Coordinator")

class HoudiniWorker:
    def __init__(self, port: int = 8765, timeout: float = 60.0):
        self.port = port
        self.timeout = timeout
        self.websocket = None

    async def __aenter__(self):
        await self._connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self._disconnect()
        return False

    async def _connect(self):
        log.info("Connecting to worker")
        self.websocket = await asyncio.get_event_loop().run_in_executor(
            None, 
            lambda: websocket.create_connection(f"ws://localhost:{self.port}")
        )
        log.info("Connection successful")

    async def _disconnect(self):
        if self.websocket:
            await self.websocket.close()

    async def send_message(self, data: Any, process_response) -> bool:
        try:
            log.debug("Sending message: %s", data)
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.websocket.send(json.dumps(data))
            )

            while True:
                try:
                    message = await asyncio.wait_for(
                        asyncio.get_event_loop().run_in_executor(
                            None,
                            self.websocket.recv
                        ),
                        timeout=self.timeout
                    )
                    response_data = json.loads(message)
                    log.debug("Received response: %s", response_data)
                    
                    completed = process_response(response_data)
                    if completed:
                        return True

                except asyncio.TimeoutError:
                    log.error("Read timeout while waiting for data")
                    return False

        except Exception as e:
            log.error("Communication error: %s", e)
            return False

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765, help="Port number for WebSocket connection")
    return parser.parse_args()

async def main():
    args = parse_args()
    async with HoudiniWorker(port=args.port) as worker:
        def process_response(response: Any) -> bool:
            completed = response["op"] == "automation" and response["data"] == "end"
            return completed

        test_message = {"op": "cook", 
                        "data": {
                            "hda_path": {"file_id": "file_xxx", "file_path": "test_cube.hda"},
                            "definition_index": 0,
                            "input0": {"file_id": "file_xxx", "file_path": "cube.usdz"},
                            "test_int": 5,
                            "test_float": 2.0,
                            "test_string": "test",
                            "test_bool": True,
                        }}

        while True:
            log.info("Requesting automation")
            success = await worker.send_message(test_message, process_response)
            log.info("Automation completed")
            await asyncio.sleep(random.uniform(3, 5))

if __name__ == "__main__":
    asyncio.run(main())
