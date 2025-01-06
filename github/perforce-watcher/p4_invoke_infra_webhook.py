import requests
import os
import sys

def notify_github(changelist_id: str):
    github_token = os.environ['GITHUB_TOKEN']
    repo_owner = "Mythica"
    repo_name = "infra"
    
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/dispatches"
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"token {github_token}",
    }
    
    data = {
        "event_type": "p4-commit",
        "client_payload": {
            "changelist": changelist_id
        }
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.status_code == 204

if __name__ == "__main__":
    if len(sys.argv) > 1:
        changelist = sys.argv[1]
        notify_github(changelist)
