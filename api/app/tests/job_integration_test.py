import requests
from typing import Optional

ENDPOINT = "https://api.mythica.ai/v1"
PROFILE_ID = "prf_2fXUBxeTyD7TXBjTHHz41MitSpG"


def start_session(endpoint: str, profile_id: str) -> str:
    url = f"{endpoint}/sessions/direct/{profile_id}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    result = response.json()
    return result['token']


def main():
    token = start_session(ENDPOINT, PROFILE_ID)
    print(token)


if __name__ == "__main__":
    main()
