import os
import subprocess
import select
import logging
import json
import argparse
from pathlib import Path
from typing import Any

logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger(__name__)

class HoudiniWorker:
    def __init__(self, executable_path: str, timeout: float = 60.0):
        self.executable_path = Path(executable_path)
        self.timeout = timeout
        self.process = None
        self.parent_to_child_read = None
        self.parent_to_child_write = None
        self.child_to_parent_read = None
        self.child_to_parent_write = None

    def __enter__(self):
        self._start_process()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._stop_process()
        return False

    def _start_process(self):
        log.info("Starting subprocess: %s", self.executable_path)
        
        self.parent_to_child_read, self.parent_to_child_write = os.pipe()
        self.child_to_parent_read, self.child_to_parent_write = os.pipe()

        self.process = subprocess.Popen(
            [str(self.executable_path),
             str(self.parent_to_child_read),
             str(self.child_to_parent_write)],
            pass_fds=(self.parent_to_child_read, self.child_to_parent_write)
        )

        os.close(self.parent_to_child_read)
        os.close(self.child_to_parent_write)

    def _stop_process(self):
        log.info("Shutting down subprocess")
        os.close(self.parent_to_child_write)
        os.close(self.child_to_parent_read)
        if self.process:
            self.process.terminate()
            self.process.wait()
            self.process = None

    def send_message(self, data: Any, process_response) -> bool:
        """Sends and receives a message with ndjson format to subprocess"""
        try:
            # Send message to subprocess
            message = json.dumps(data) + "\n"
            os.write(self.parent_to_child_write, message.encode())
                        
            # Read response stream until response is received
            buffer = ""
            while True:
                ready, _, _ = select.select([self.child_to_parent_read], [], [], self.timeout)
                if not ready:
                    log.error("Read timeout while waiting for data")
                    return False
                
                chunk = os.read(self.child_to_parent_read, 4096).decode()
                if not chunk:
                    log.error("Connection closed")
                    return False
                
                buffer += chunk

                # Process recieved messages
                newline_idx = buffer.find('\n')
                if newline_idx >= 0:
                    message = buffer[:newline_idx]
                    buffer = buffer[newline_idx + 1:]
                    try:
                        response_data = json.loads(message)
                    except json.JSONDecodeError:
                        log.error("Invalid JSON response")
                        return False
                    
                    log.debug("Received response: %s", response_data)
                    completed = process_response(response_data)
                    if completed:
                        assert(len(buffer) == 0)
                        return True
            
        except (OSError, IOError) as e:
            log.error("Communication error: %s", e)
            return False

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--executable", required=True, help="Path to executable to run")
    return parser.parse_args()

def main():
    args = parse_args()
    
    with HoudiniWorker(args.executable) as worker:
        def process_response(response: Any) -> bool:
            log.info("Response: %s", response)
            return response["op"] == "cook_response"

        test_message = {"op": "cook", 
                        "data": {
                            "hda_path": "test_cube.hda", 
                            "definition_index": 0
                        }}
        success = worker.send_message(test_message, process_response)
        log.info("Success: %s", success)

if __name__ == "__main__":
    main()
