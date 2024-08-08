"""Wrapper script to invoke hautomation from events"""
import argparse
import asyncio
import subprocess
import os
import logging
import requests
import tempfile
import shutil

from pathlib import Path
from munch import munchify

from events.events import EventsSession

from api.api.files import API, api_settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_LOCAL = os.path.join(SCRIPT_DIR, "output")

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


def start_session(profile_id):
    """Create a session for the current profile"""
    url = f"{api_settings().endpoint}/profiles/start_session/{profile_id}"
    response = requests.get(url, timeout=10)
    if response.status_code != 200:
        log.warning("Failed to start session: %s", response.status_code)
        raise SystemExit

    o = munchify(response.json())
    return o.token


def process_event(o, endpoint: str):
    # hello_world_cmd = "hserver -S https://www.sidefx.com/license/sesinetd && hython /darol/automation/helloworld.py && hserver -Q"
    api = API(requests, endpoint)
    token = start_session(o.profile_id)
    with tempfile.TemporaryDirectory() as tmp_dir:

        output_path = api.download_file(o.file_id, Path(tmp_dir))
        if output_path is None:
            raise FileNotFoundError

        if not str(output_path).endswith('.hda'):
            log.info(
                "File %s is not an .hda file. Skipping processing.", str(output_path))
            return

        # Write out a test file
        os.makedirs(OUTPUT_LOCAL, exist_ok=True)

        testfile_path = f"{OUTPUT_LOCAL}/testfile.txt"
        with open(testfile_path, 'w') as file:
            file.write("Hello, World!")

        upload_results(token, endpoint)


def upload_results(token, endpoint: str):
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


async def main():
    """Async entrypoint to test worker dequeue, looks for SQL_URL
    environment variable to form an initial connection"""
    args = parse_args()
    sql_url = os.environ.get(
        'SQL_URL',
        'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline')
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 3)
    async with EventsSession(sql_url, sleep_interval) as session:
        async for event_id, json_data in session.ack_next():
            log.info("%s: %s", event_id, json_data)
            o = munchify(json_data)
            process_event(o, args.endpoint)
            await session.complete(event_id)


if __name__ == '__main__':
    asyncio.run(main())
