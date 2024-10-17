import argparse
import logging
import requests
import time


logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)


PROFILE_NAME = "Mythica_Canary"
JOB_DEF_ID = "jobdef_r1NnWBt5TtwxL5B8DLTMFYR6py"


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


def request_job(endpoint: str, headers: str) -> str:
    body = {
        "job_def_id": JOB_DEF_ID,
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

    job_id = request_job(endpoint, headers)
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
