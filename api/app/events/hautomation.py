"""Wrapper script to invoke hautomation from events"""
import asyncio
import subprocess
import os
import logging
import requests
import tempfile

from pathlib import Path
from munch import munchify

from events.events import EventsSession

from api.files import API

# Configure logging
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


log = logging.getLogger(__name__)

CONTAINER_REPO = 'us-central1-docker.pkg.dev/controlnet-407314/gke-us-central1-images'
CONTAINER_NAME = 'darol-houdini'
CONTAINER_TAG = 'latest'
IMAGE_NAME = f"{CONTAINER_REPO}/{CONTAINER_NAME}:{CONTAINER_TAG}"
IMAGE_NAME = f"hautomation"


def run_docker(docker_command: list[str]):
    try:
        log.info(f"running {' '.join(docker_command)}")
        result = subprocess.run(
            docker_command,
            capture_output=True,
            text=True,
            check=False  # Set to True if you want it to raise an exception on non-zero return code
        )
        return result.stdout, result.stderr, result.returncode
    except subprocess.CalledProcessError as e:
        return e.stdout, e.stderr, e.returncode


def process_output(stdout, stderr, returncode):
    log.info(f"output {stdout}")
    log.info(f"stderr {stderr}")
    log.info(f"returncode {returncode}")
    if returncode != 0:
        raise ValueError(f"returncode was {returncode}")


def pull_container():
    process_output(*run_docker(['docker', 'pull', IMAGE_NAME]))


def launch_container(o):
    hello_world_cmd = "hserver -S https://www.sidefx.com/license/sesinetd && hython /darol/automation/helloworld.py && hserver -Q"
    api = API(requests)
    with tempfile.TemporaryDirectory() as tmp_dir:
        
        output_path = api.download_file(o.file_id, Path(tmp_dir))
        if output_path is None:
            raise FileNotFoundError

        downloaded_path = str(output_path)
        gather_deps_cmd = f"hserver -S https://www.sidefx.com/license/sesinetd && hython /darol/automation/gather_dependencies.py --output-path /output --hda-path={downloaded_path} && hserver -Q"

        process_output(*run_docker(["docker", "run", "--rm", "-it", IMAGE_NAME, '/bin/sh', '-c', gather_deps_cmd]))


def parse_job_data(_):
    pass


async def main():
    """Async entrypoint to test worker dequeue, looks for SQL_URL
    environment variable to form an initial connection"""
    # pull_container()
    sql_url = os.environ.get('SQL_URL', 'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline')
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 3)
    async with EventsSession(sql_url, sleep_interval) as session:
        async for event_id, json_data in session.ack_next():
            try:
                log.info(f"{event_id}: {json_data}")
                o = munchify(json_data)
                launch_container(o)
                await session.complete(event_id)
            except Exception as ex:
                log.exception("failure running container") 


if __name__ == '__main__':
    asyncio.run(main())
