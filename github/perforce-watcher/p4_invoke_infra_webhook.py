import os
import requests
import sys


def notify_github(changelist_id: str):
    github_token = os.environ.get("GITHUB_TOKEN")
    repo_owner = "MythicaAI"
    repo_name = "infra"

    url = (f"https://api.github.com/repos/{repo_owner}/{repo_name}"
           "/actions/workflows/bulk-import-mythica-p4.yaml/dispatches")

    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"token {github_token}",
    }

    data = {
        "ref": "main",
        "inputs": {
            "changelist": changelist_id
        }
    }
    print(f"posting {data} to {url}")
    response = requests.post(url, headers=headers, json=data)
    print("### response: ")
    print(f"{response.text}")
    response.raise_for_status()
    return response.status_code == 204


if __name__ == "__main__":
    if len(sys.argv) > 1:
        changelist = sys.argv[1]
        notify_github(changelist)
    else:
        print("no changelist provided")
