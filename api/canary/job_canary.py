import argparse
import hashlib
import logging
import os
from http import HTTPStatus
from typing import Optional

import requests
import time

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)

PROFILE_NAME = "Mythica_Canary"
HDA_FILE = "test_scale_input.hda"
MESH_FILE = "cube.usdz"

TEST_FREQUENCY_SEC = 600
JOB_TIMEOUT_SEC = 30


def parse_args():
    parser = argparse.ArgumentParser(description="Canary test for jobs")

    parser.add_argument(
        "-e", "--endpoint",
        help="API endpoint",
        required=True
    )

    parser.add_argument(
        "-k", "--api_key",
        help="API access key",
        required=True
    )

    return parser.parse_args()


def find_or_create_profile(endpoint: str) -> str:
    response = requests.get(f"{endpoint}/profiles/named/{PROFILE_NAME}?exact=true")
    response.raise_for_status()
    profiles = response.json()
    if len(profiles) == 1:
        return profiles[0]['profile_id']

    profile_json = {
        "name": PROFILE_NAME,
        "email": "donotreply+canary@mythica.ai",
        "description": "Mythica canary test profile",
    }
    response = requests.post(f"{endpoint}/profiles/", json=profile_json)
    response.raise_for_status()
    return response.json()['profile_id']


def start_session(endpoint: str, api_key: str) -> str:
    url = f"{endpoint}/sessions/key/{api_key}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    result = response.json()
    return result['token']


def upload_file(endpoint: str, headers: str, file_path: str) -> str:
    page_size = 256 * 1024
    sha1 = hashlib.sha1()
    with open(file_path, "rb") as file:
        content = file.read(page_size)
        content_hash = sha1.update(content)
    digest = sha1.hexdigest()
    response = requests.get(f"{endpoint}/files/by_content/{digest}",
                            headers=headers)

    # return the file_id if the content digest already exists
    if response.status_code == HTTPStatus.OK:
        file_id = response.json()['file_id']
        log.info("Found existing file: %s, sha1: %s", file_id, digest)
        return file_id

    # raise on unexpected result
    if response.status_code != HTTPStatus.NOT_FOUND:
        response.raise_for_status()

    # upload the new file
    with open(file_path, 'rb') as file:
        file_name = os.path.basename(file_path)
        file_data = [('files', (file_name, file, 'application/octet-stream'))]
        response = requests.post(f"{endpoint}/upload/store", headers=headers, files=file_data)
        response.raise_for_status()
        result = response.json()
        file = result['files'][0]
        file_id = file['file_id']
        content_hash = file['content_hash']
        log.info("Uploaded file: %s, sha1: %s", file_id, content_hash)
        return file_id


def get_job_def(endpoint: str, file_id: str) -> Optional[str]:
    url = f"{endpoint}/jobs/definitions"
    response = requests.get(url, timeout=60)
    response.raise_for_status()

    job_defs = response.json()
    for job_def in job_defs:
        if job_def['job_type'] != 'houdini::/mythica/generate_mesh':
            continue

        if job_def['params_schema']['params']['hda_file']['default'] == file_id:
            return job_def['job_def_id']
    log.error("Job def not found (%s definitions)", len(job_defs))
    raise ValueError("Missing job definition")


def request_job(endpoint: str, headers: str, job_def_id: str, mesh_file_id: str) -> str:
    body = {
        "job_def_id": job_def_id,
        "params": {
            "input0": {"file_id": mesh_file_id},
            "format": "usdz"
        }
    }

    url = f"{endpoint}/jobs/"
    response = requests.post(url, headers=headers, timeout=10, json=body)
    response.raise_for_status()

    result = response.json()
    return result['job_id']


def check_job_status(endpoint: str, headers: str, job_id: str) -> Optional[str]:
    url = f"{endpoint}/jobs/results/{job_id}"
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    result = response.json()
    completed = result['completed']
    if not completed:
        return None

    for result in result['results']:
        if result['result_data']['item_type'] == 'file':
            files = result['result_data']['files']['mesh']
            if len(files) > 0:
                return files[0]

    raise Exception("Job failed to generate mesh.")


def get_job_result(endpoint: str, headers: str, job_id: str) -> str:
    start_time = time.time()
    while True:
        result_file_id = check_job_status(endpoint, headers, job_id)
        if result_file_id:
            return result_file_id
        if time.time() - start_time > JOB_TIMEOUT_SEC:
            raise Exception("Timeout exceeded: Job never completed.")
        time.sleep(1)


def delete_job_defs(endpoint: str, headers: str) -> str:
    url = f"{endpoint}/jobs/definitions/delete_canary_jobs_def"
    response = requests.delete(url, headers=headers, timeout=10)
    response.raise_for_status()
    log.info(f"Job defs successfully deleted")


def run_test(endpoint: str, api_key: str):
    log.info("Starting test")

    profile_id = find_or_create_profile(endpoint)
    log.info(f"Using profile: {profile_id}")

    token = start_session(endpoint, api_key)
    headers = {"Authorization": f"Bearer {token}"}
    log.info(f"Got token: {token}")

    hda_file_id = upload_file(endpoint, headers, HDA_FILE)
    log.info(f"Using HDA: {hda_file_id}")

    job_def_id = get_job_def(endpoint, hda_file_id)
    log.info(f"Using job def: {job_def_id}")

    mesh_file_id = upload_file(endpoint, headers, MESH_FILE)
    log.info(f"Uploaded mesh file: {mesh_file_id}")

    job_id = request_job(endpoint, headers, job_def_id, mesh_file_id)
    log.info(f"Started job: {job_id}")

    result_file_id = get_job_result(endpoint, headers, job_id)
    log.info(f"Received job result file: {result_file_id}")

    log.info("Job completed successfully")
    delete_job_defs(endpoint, headers)


def main():
    args = parse_args()

    while True:
        try:
            run_test(args.endpoint, args.api_key)
        except Exception as e:
            log.error(f"Test failed: {e}")
        log.info("Retrying test in %s seconds...", TEST_FREQUENCY_SEC)
        time.sleep(TEST_FREQUENCY_SEC)


if __name__ == '__main__':
    main()
