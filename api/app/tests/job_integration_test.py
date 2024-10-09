import requests
import time


ENDPOINT = "https://api.mythica.ai/v1"
PROFILE_ID = "prf_2fXUBxeTyD7TXBjTHHz41MitSpG"
JOB_DEF_ID = "jobdef_3L84Ln8H9mnxvyhhJDbLq3mbrefR"


def start_session(endpoint: str, profile_id: str) -> str:
    url = f"{endpoint}/sessions/direct/{profile_id}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    result = response.json()
    return result['token']


def request_job(endpoint: str, headers: str) -> str:
    body = {
        "job_def_id": JOB_DEF_ID,
        "input_files": [],
        "params": {}
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
    print(f"Received result: {result}")

    return result['completed']


def main():
    token = start_session(ENDPOINT, PROFILE_ID)
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Got token: {token}")

    job_id = request_job(ENDPOINT, headers)
    print(f"Started job: {job_id}")
 
    while True:
        completed = check_job_status(ENDPOINT, headers, job_id)
        if completed:
            break
        time.sleep(1)

    print("Job completed")


if __name__ == "__main__":
    main()
