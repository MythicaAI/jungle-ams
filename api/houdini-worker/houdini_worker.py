"""Wrapper script to invoke hautomation from events"""
import argparse
import asyncio
import json
import os
import logging
import requests
import tempfile
import select
import subprocess
import shutil

from auth.api_id import job_seq_to_id
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
    url = f"{endpoint}/sessions/direct/{profile_id}"
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


def process_generate_mesh_job_impl(runner, o, endpoint: str, event_seq: int, token: str):
    with tempfile.TemporaryDirectory() as tmp_dir:
        # Download the HDA file
        file_path = download_file(endpoint, o.config.hda_file, Path(tmp_dir))
        if file_path is None:
            raise FileNotFoundError

        if not str(file_path).endswith('.hda'):
            log.info(
                "File %s is not an .hda file. Skipping processing.", str(file_path))
            return

        # Resolve all input files to local disk
        input_files_local = []
        for input_file in o.input_files:
            input_file_path = Path("")
            if len(input_file) > 0:
                input_file_path = download_file(endpoint, input_file, Path(tmp_dir))
            input_files_local.append(str(input_file_path))

        # Prepare the parameters file
        parms_data = {
            'mesh_parms': o.params.mesh_params,
            'material_parms': o.params.material_params,
            'inputs': input_files_local
        }

        params_file = os.path.join(tmp_dir, 'params.json')
        with open(params_file, 'w') as f:
            f.write(json.dumps(parms_data))

        output_file_name = f"{job_seq_to_id(o.job_seq)}_mesh"

        # Execute the job
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
        runner.execute_job(json.dumps(job))

        output_file_path = os.path.join(OUTPUT_DIR, f"{output_file_name}.usdz")
        if not os.path.exists(output_file_path):
            log.warning("Failed to generate mesh file")
            return

        # Submit results
        file_id = upload_file(token, endpoint, output_file_path)
        submit_job_result(endpoint, o.job_seq, { 'file_id': file_id })

def process_generate_mesh_job(runner, o, endpoint: str, event_seq: int):
    token = start_session(endpoint, o.profile_id)

    process_generate_mesh_job_impl(runner, o, endpoint, event_seq, token)

    mark_job_as_completed(endpoint, o.job_seq)

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
        runner.execute_job(json.dumps(job))

        interface_file_path = os.path.join(OUTPUT_DIR, output_file_name)
        if os.path.exists(interface_file_path):
            create_job_definition(token, endpoint, o.file_id, interface_file_path)
            os.remove(interface_file_path)
        else:
            log.warning("Failed to create job definition")

def create_job_definition(token, endpoint: str , file_id: str, interface_file_path: str):
    with open(interface_file_path, 'r') as f:
        interface_json = json.load(f)
        interface = munchify(interface_json)

        for index, node_type in enumerate(interface):
            definition = {
                'job_type': 'houdini_generate_mesh',
                'name': f"Generate {node_type.name}",
                'description': node_type.description,
                'config': {
                    'hda_file': file_id,
                    'hda_definition_index': index
                },
                'input_files': node_type.inputs,
                'params_schema': node_type.defaults
            }
            response = requests.post(
                f"{endpoint}/jobs/definitions",
                json=definition, timeout=10)
            if response.status_code == 201:
                log.info("Successfully created job definition for %s", node_type.name)
            else:
                log.warning("Failed to create job definition for %s. Status code: %s",
                            node_type.name, response.status_code)

def submit_job_result(endpoint: str, job_seq: str, result_data: str):
    job_id = job_seq_to_id(job_seq)
    data = {
        'created_in': 'houdini-worker',
        'result_data': result_data
    }
    response = requests.post(f'{endpoint}/jobs/results/{job_id}', 
                             json=data, timeout=10)
    if response.status_code == 201:
        log.info("Successfully submitted job result for %s", job_id)
    else:
        log.warning("Failed to submit job result for %s. Status code: %s",
                    job_id, response.status_code)


def mark_job_as_completed(endpoint: str, job_seq: str):
    job_id = job_seq_to_id(job_seq)
    response = requests.post(f'{endpoint}/jobs/complete/{job_id}', timeout=10)
    if response.status_code == 200:
        log.info("Successfully marked job as completed for %s", job_id)
    else:
        log.warning("Failed to mark job as completed for %s. Status code: %s",
                    job_id, response.status_code)

def upload_file(token: str, endpoint: str, file_path: str) -> str:
    headers = {"Authorization": "Bearer %s" % token}

    file_id = None
    with open(file_path, 'rb') as file:
        file_name = os.path.basename(file_path)
        file_data = [
            ('files', (file_name, file, 'application/octet-stream'))]
        response = requests.post(
            f"{endpoint}/upload/store",
            headers=headers, files=file_data, timeout=10)
        if response.status_code == 200:
            log.info("Successfully uploaded %s", file_name)
            o = munchify(response.json())
            file_id = o.files[0].file_id

    os.remove(file_path)
    return file_id

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
        self.job_timeout = 60.0
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

        self._start_process()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._stop_process()

        log.info("Shutting down license server")
        cmd = ['/bin/bash','-c', 'hserver -Q']
        result = subprocess.run(cmd)
        if result.returncode != 0:
            raise Exception("Failed to stop hserver")

        return False
    
    def _start_process(self):
        log.info("Starting hython process")

        self.parent_to_child_read, self.parent_to_child_write = os.pipe()
        self.child_to_parent_read, self.child_to_parent_write = os.pipe()

        cmd = ['/bin/bash','-c', f"hython /darol/automation/job_runner.py --pipe-read={self.parent_to_child_read} --pipe-write={self.child_to_parent_write}"]
        self.process = subprocess.Popen(cmd, pass_fds=(self.parent_to_child_read, self.child_to_parent_write))

        os.close(self.parent_to_child_read)
        os.close(self.child_to_parent_write)

    def _stop_process(self):
        log.info("Shutting down hython process")
        os.close(self.parent_to_child_write)
        os.close(self.child_to_parent_read)
        if self.process:
            self.process.terminate()
            self.process.wait()
            self.process = None

    def _execute_job_impl(self, job) -> bool:
        try:
            os.write(self.parent_to_child_write, job.encode() + b'\n')
        except Exception as e:
            log.error("Failed to send job data to child process")
            return False

        ready, _, _ = select.select([self.child_to_parent_read], [], [], self.job_timeout)
        if not ready:
            log.error("Job timed out")
            return False
        
        result = os.read(self.child_to_parent_read, 1024).decode()
        if result != "Job completed":
            log.error("Job encountered an error")
            return False

        return True

    def execute_job(self, job) -> bool:
        log.info("Processing job: %s", job)

        success = self._execute_job_impl(job)
        if not success:
            log.info("Job failed, restarting hython process")
            self._stop_process()
            self._start_process()
            return False
        
        log.info("Job completed")
        return True

async def main():
    """Async entrypoint to test worker dequeue, looks for SQL_URL
    environment variable to form an initial connection"""
    args = parse_args()
    sql_url = os.environ.get(
        'SQL_URL',
        'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline')
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 3)
    with HoudiniJobRunner() as runner:
        async with EventsSession(sql_url, sleep_interval, event_type_prefixes=['houdini_generate_mesh:requested', 'file_uploaded:hda']) as session:
            async for event_seq, event_type, json_data in session.ack_next():
                log.info("%s: %s %s", event_seq, event_type, json_data)
                o = munchify(json_data)

                if event_type == 'houdini_generate_mesh:requested':
                    process_generate_mesh_job(runner, o, args.endpoint, event_seq)
                elif event_type == 'file_uploaded:hda':
                    process_hda_uploaded_event(runner, o, args.endpoint)

                await session.complete(event_seq)


if __name__ == '__main__':
    asyncio.run(main())
