import argparse
import logging
import os
import requests
import time
from typing import Optional


logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)


PROFILE_NAME = "Mythica_Canary"
HDA_FILE = "test_cube.hda"


def parse_args():
    parser = argparse.ArgumentParser(description="Canary test for jobs")

    parser.add_argument(
        "-e", "--endpoint",
        help="API endpoint",
        required=False
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


def start_session(endpoint: str, profile_id: str) -> str:
    url = f"{endpoint}/sessions/direct/{profile_id}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    result = response.json()
    return result['token']


def upload_file(endpoint: str, headers: str, file_path: str) -> str:
    file_id = None
    with open(file_path, 'rb') as file:
        file_name = os.path.basename(file_path)
        file_data = [('files', (file_name, file, 'application/octet-stream'))]
        response = requests.post(f"{endpoint}/upload/store", headers=headers, files=file_data)
        response.raise_for_status()
        result = response.json()
        file_id = result['files'][0]['file_id']
    return file_id


def find_job_def(endpoint: str, file_id: str) -> Optional[str]:
    url = f"{endpoint}/jobs/definitions"
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    job_defs = response.json()
    for job_def in job_defs:
        if job_def['job_type'] != 'houdini::/mythica/generate_mesh':
            continue
        
        if job_def['params_schema']['params']['hda_file']['default'] == file_id:
            return job_def['job_def_id']

    return None


def request_job(endpoint: str, headers: str, job_def_id: str) -> str:
    body = {
        "job_def_id": job_def_id,
        "params": {
            "params": {
                "randseed": 0,
                "color": [0.5, 0.5, 0.5],
                "color2": [0.5, 0.5, 0.5]
            }
        }
    }

    url = f"{endpoint}/jobs/"
    response = requests.post(url, headers=headers, timeout=10, json=body)
    response.raise_for_status()

    result = response.json()
    return result['job_id']


def check_job_status(endpoint: str, headers: str, job_id: str) -> bool:
    url = f"{endpoint}/jobs/results/{job_id}"
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    result = response.json()
    log.info(f"Received result: {result}")

    return result['completed']


def run_test(endpoint: str):
    profile_id = find_or_create_profile(endpoint)
    log.info(f"Using profile: {profile_id}")

    token = start_session(endpoint, profile_id)
    headers = {"Authorization": f"Bearer {token}"}
    log.info(f"Got token: {token}")

    file_id = upload_file(endpoint, headers, HDA_FILE)
    log.info(f"Uploaded file: {file_id}")

    job_def_id = None
    while True:
        job_def_id = find_job_def(endpoint, file_id)
        if job_def_id:
            break
        time.sleep(1)
    log.info(f"Found created job def: {job_def_id}")

    job_id = request_job(endpoint, headers, job_def_id)
    log.info(f"Started job: {job_id}")
 
    while True:
        completed = check_job_status(endpoint, headers, job_id)
        if completed:
            break
        time.sleep(1)

    log.info("Job completed")


def main():
    args = parse_args()

    while True:
        run_test(args.endpoint)
        time.sleep(30)


if __name__ == '__main__':
    main()
