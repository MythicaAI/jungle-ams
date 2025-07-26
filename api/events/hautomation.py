"""Wrapper script to invoke hautomation from events"""
import asyncio
import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import requests
from events.events import EventsSession
from file_access import API, api_settings
from munch import munchify

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)

CONTAINER_REPO = 'us-central1-docker.pkg.dev/controlnet-407314/gke-us-central1-images'
CONTAINER_NAME = 'darol-houdini'
CONTAINER_TAG = 'latest'
IMAGE_NAME = f"{CONTAINER_REPO}/{CONTAINER_NAME}:{CONTAINER_TAG}"
IMAGE_NAME = "hautomation"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_LOCAL = os.path.join(SCRIPT_DIR, "output")


def run_docker(docker_command: list[str]):
    try:
        log.info("running %s", ' '.join(docker_command))
        result = subprocess.run(
            docker_command,
            capture_output=True,
            text=True,
            check=False  # Set to True if you want it to raise an exception on non-zero return code
        )
        return result.stdout, result.stderr, result.returncode
    except subprocess.CalledProcessError as e:
        return e.stdout, e.stderr, e.returncode


def start_session(profile_id):
    """Create a session for the current profile"""
    url = f"{api_settings().endpoint}/sessions/direct/{profile_id}"
    response = requests.get(url, timeout=10)
    if response.status_code != 200:
        log.warning("Failed to start session: %s", response.status_code)
        raise SystemExit

    o = munchify(response.json())
    return o.token


def process_output(stdout, stderr, returncode):
    log.info("output %s", stdout)
    log.info("stderr %s", stderr)
    log.info("returncode %s", returncode)
    if returncode != 0:
        log.error("Unable to process HDA. returncode was %s", returncode)


def pull_container():
    process_output(*run_docker(['docker', 'pull', IMAGE_NAME]))


def launch_container(o):
    # hello_world_cmd = "hserver -S https://www.sidefx.com/license/sesinetd && hython /darol/automation/helloworld.py && hserver -Q"
    api = API(requests)
    token = start_session(o.profile_id)
    with tempfile.TemporaryDirectory() as tmp_dir:

        output_path = api.download_file(o.file_id, Path(tmp_dir))
        if output_path is None:
            raise FileNotFoundError

        if not str(output_path).endswith('.hda'):
            log.info(
                "File %s is not an .hda file. Skipping processing.", str(output_path))
            return

        downloaded_path = str(output_path)
        gather_deps_cmd = ("hserver -S https://www.sidefx.com/license/sesinetd"
                           " && hython /darol/automation/gather_dependencies.py"
                           " --output-path /output"
                           f" --hda-path={downloaded_path} && hserver -Q")
        gen_network_cmd = ("hserver -S https://www.sidefx.com/license/sesinetd"
                           " && hython /darol/automation/inspect.py"
                           " --output-path /output"
                           f" --hda-path={downloaded_path}"
                           " && hserver -Q")
        process_output(*run_docker(
            ["docker", "run",
             "--rm",
             "-it",
             "-v", "/tmp:/tmp",
             "-v", f"{OUTPUT_LOCAL}:/output",
             IMAGE_NAME,
             '/bin/sh',
             '-c', gather_deps_cmd]))
        process_output(*run_docker(
            ["docker", "run",
             "--rm",
             "-it",
             "-v", "/tmp:/tmp",
             "-v", f"{OUTPUT_LOCAL}:/output",
             IMAGE_NAME,
             '/bin/sh',
             '-c', gen_network_cmd]))

        upload_results(token)


def upload_results(token):
    headers = {"Authorization": "Bearer %s" % token}
    with tempfile.TemporaryDirectory() as tmp_dir:
        for root, _, files in os.walk(OUTPUT_LOCAL):
            for file_name in files:
                file_path = os.path.join(root, file_name)
                temp_file_path = os.path.join(tmp_dir, file_name)

                # Copy file to temporary directory
                shutil.copyfile(file_path, temp_file_path)

                with open(temp_file_path, 'rb') as file:
                    file_data = [
                        ('files', (file_name, file, 'application/octet-stream'))]
                    response = requests.post(
                        f"{api_settings().endpoint}/upload/store",
                        headers=headers, files=file_data,
                        timeout=10)
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


def parse_job_data(_):
    pass


async def main():
    """Async entrypoint to test worker dequeue, looks for SQL_URL
    environment variable to form an initial connection"""
    # pull_container()
    sql_url = os.environ.get(
        'SQL_URL',
        'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline')
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 3)
    async with EventsSession(sql_url, sleep_interval, event_type_prefixes=[]) as session:
        async for event_id, _, json_data in session.ack_next():
            log.info("%s: %s", event_id, json_data)
            o = munchify(json_data)
            launch_container(o)
            await session.complete(event_id)


if __name__ == '__main__':
    asyncio.run(main())
