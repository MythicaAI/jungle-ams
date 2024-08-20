"""Wrapper script to invoke hautomation from events"""
import argparse
import asyncio
import json
import os
import logging
import requests
import tempfile
import subprocess
import shutil

from auth.api_id import event_seq_to_id
from http import HTTPStatus
from pathlib import Path
from munch import munchify

from events.events import EventsSession

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")

def parse_args():
    """Parse command line arguments and provide the args structure"""
    parser = argparse.ArgumentParser(description="Packager")

    parser.add_argument(
        "-e", "--endpoint",
        help="API endpoint",
        default="http://localhost:5555",
        required=False
    )

    return parser.parse_args()


def start_session(endpoint: str, profile_id: str):
    """Create a session for the current profile"""
    url = f"{endpoint}/profiles/start_session/{profile_id}"
    response = requests.get(url, timeout=10)
    if response.status_code != 200:
        log.warning("Failed to start session: %s", response.status_code)
        raise SystemExit

    o = munchify(response.json())
    return o.token


def download_file(endpoint: str, file_id: str, local_path: Path) -> Path:
    """Download a file_id to a local path"""
    url = f"{endpoint}/download/info/{file_id}"
    r = requests.get(url)
    assert r.status_code == HTTPStatus.OK
    log.info("response: %s", r.text)
    doc = r.json()
    log.info("response: %s", json.dumps(doc))
    o = munchify(doc)
    file_name = o.name.replace('\\', '_').replace('/', '_')
    local_file_name = os.path.join(local_path, file_name)
    log.info("downloading from %s to %s",
                o.url,
                local_file_name)
    os.makedirs(os.path.dirname(local_file_name), exist_ok=True)
    downloaded_bytes = 0
    with open(local_file_name, "w+b") as f:
        download_req = requests.get(o.url, stream=True)
        for chunk in download_req.iter_content(chunk_size=1024):
            if chunk:
                downloaded_bytes += len(chunk)
                f.write(chunk)
    log.info("download complete, %s bytes", downloaded_bytes)
    return Path(local_file_name)


def process_generate_mesh_event(runner, o, endpoint: str, event_seq: int):
    token = start_session(endpoint, o.profile_id)
    with tempfile.TemporaryDirectory() as tmp_dir:

        file_path = download_file(endpoint, o.file_id, Path(tmp_dir))
        if file_path is None:
            raise FileNotFoundError

        if not str(file_path).endswith('.hda'):
            log.info(
                "File %s is not an .hda file. Skipping processing.", str(file_path))
            return

        params_file = os.path.join(tmp_dir, 'params.json')
        with open(params_file, 'w') as f:
            f.write(json.dumps(o.params))

        output_file_name = f"{event_seq_to_id(event_seq)}_mesh"

        job = {
            'type': "export_mesh",
            'args': {
                'output-path': OUTPUT_DIR,
                'output-file-name': output_file_name,
                'format': 'usdz',
                'hda-path': str(file_path),
                'parms': params_file
            }
        }
        runner.send_job(json.dumps(job))

        upload_results(token, endpoint)

def process_hda_uploaded_event(runner, o, endpoint: str):
    token = start_session(endpoint, o.profile_id)
    with tempfile.TemporaryDirectory() as tmp_dir:

        file_path = download_file(endpoint, o.file_id, Path(tmp_dir))
        if file_path is None:
            raise FileNotFoundError

        if not str(file_path).endswith('.hda'):
            log.info(
                "File %s is not an .hda file. Skipping processing.", str(file_path))
            return

        output_file_name = f"{o.file_id}_interface.json"

        job = {
            'type': "interface",
            'args': {
                'output-path': OUTPUT_DIR,
                'output-file-name': output_file_name,
                'hda-path': str(file_path)
            }
        }
        runner.send_job(json.dumps(job))

        upload_results(token, endpoint)

def upload_results(token, endpoint: str):
    headers = {"Authorization": "Bearer %s" % token}
    with tempfile.TemporaryDirectory() as tmp_dir:
        for root, _, files in os.walk(OUTPUT_DIR):
            for file_name in files:
                file_path = os.path.join(root, file_name)
                temp_file_path = os.path.join(tmp_dir, file_name)

                # Copy file to temporary directory
                shutil.copyfile(file_path, temp_file_path)

                with open(temp_file_path, 'rb') as file:
                    file_data = [
                        ('files', (file_name, file, 'application/octet-stream'))]
                    response = requests.post(
                        f"{endpoint}/upload/store",
                        headers=headers, files=file_data, timeout=10)
                    if response.status_code == 200:
                        log.info("Successfully uploaded %s", file_name)
                        try:
                            os.remove(file_path)
                        except OSError as e:
                            log.warning(
                                "Failed to remove %s: %s", file_path, e)
                    else:
                        log.warning("Failed to upload %s. Status code: %s",
                                    file_name, response.status_code)
                        log.warning(response.text)

class HoudiniJobRunner:
    def __init__(self):
        self.process = None
        self.parent_to_child_read = None
        self.parent_to_child_write = None
        self.child_to_parent_read = None
        self.child_to_parent_write = None

    def __enter__(self):
        log.info("Starting license server")
        cmd = ['/bin/bash','-c', 'hserver -S https://www.sidefx.com/license/sesinetd']
        result = subprocess.run(cmd)
        if result.returncode != 0:
            raise Exception("Failed to start hserver")

        self.parent_to_child_read, self.parent_to_child_write = os.pipe()
        self.child_to_parent_read, self.child_to_parent_write = os.pipe()

        log.info("Starting hython process")
        cmd = ['/bin/bash','-c', f"hython /darol/automation/job_runner.py {self.parent_to_child_read} {self.child_to_parent_write}"]
        self.process = subprocess.Popen(cmd, pass_fds=(self.parent_to_child_read, self.child_to_parent_write))

        os.close(self.parent_to_child_read)
        os.close(self.child_to_parent_write)

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        log.info("Shutting down hython process")
        os.close(self.parent_to_child_write)
        os.close(self.child_to_parent_read)
        if self.process:
            self.process.terminate()
            self.process.wait()

        log.info("Shutting down license server")
        cmd = ['/bin/bash','-c', 'hserver -Q']
        result = subprocess.run(cmd)
        if result.returncode != 0:
            raise Exception("Failed to stop hserver")

        return False
    
    def send_job(self, job):
        log.info("Processing job: %s", job)
        os.write(self.parent_to_child_write, job.encode() + b'\n')
        os.read(self.child_to_parent_read, 1024).decode().strip()
        log.info("Job completed")


async def main():
    """Async entrypoint to test worker dequeue, looks for SQL_URL
    environment variable to form an initial connection"""
    args = parse_args()
    sql_url = os.environ.get(
        'SQL_URL',
        'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline')
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 3)
    async with EventsSession(sql_url, sleep_interval, event_type_prefixes=['generate_mesh_requested', 'file_uploaded:hda']) as session:
        async for event_seq, event_type, json_data in session.ack_next():
            log.info("%s: %s %s", event_seq, event_type, json_data)
            o = munchify(json_data)

            with HoudiniJobRunner() as runner:
                if event_type == 'generate_mesh_requested':
                    process_generate_mesh_event(runner, o, args.endpoint, event_seq)
                elif event_type == 'file_uploaded:hda':
                    process_hda_uploaded_event(runner, o, args.endpoint)

            await session.complete(event_seq)


if __name__ == '__main__':
    asyncio.run(main())
