import os
import subprocess
import select
import logging
import json
import argparse
import asyncio
import websocket
from pathlib import Path
from typing import Any

logging.basicConfig(
    level=logging.DEBUG,
    format='%(name)s: %(levelname)s: %(message)s'
)
log = logging.getLogger("Coordinator")

class HoudiniWorker:
    def __init__(self, executable_path: str, port: int = 8765, timeout: float = 60.0):
        self.executable_path = Path(executable_path)
        self.port = port
        self.timeout = timeout
        self.process = None
        self.websocket = None

    async def __aenter__(self):
        await self._start_process()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self._stop_process()
        return False

    async def _start_process(self):
        log.info("Starting subprocess: %s", self.executable_path)
        self.process = subprocess.Popen(
            [str(self.executable_path), str(self.port)],
        )
        # Wait for server to start
        await asyncio.sleep(1)
        # websocket-client is synchronous, need to wrap in asyncio
        self.websocket = await asyncio.get_event_loop().run_in_executor(
            None, 
            lambda: websocket.create_connection(f"ws://localhost:{self.port}")
        )

    async def _stop_process(self):
        log.info("Shutting down subprocess")
        if self.websocket:
            await self.websocket.close()
        if self.process:
            self.process.terminate()
            self.process.wait()
            self.process = None

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
    parser.add_argument("--executable", required=True, help="Path to executable to run")
    return parser.parse_args()

async def main():
    args = parse_args()

    async with HoudiniWorker(args.executable) as worker:
        def process_response(response: Any) -> bool:
            completed = response["op"] == "automation" and response["data"] == "end"
            if completed:
                log.info("Received completed response")
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
        
        log.info("Starting test")
        success = await worker.send_message(test_message, process_response)
        log.info("Success: %s", success)

if __name__ == "__main__":
    asyncio.run(main())
