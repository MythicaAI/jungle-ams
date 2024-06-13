"""Wrapper script to invoke hautomation from events"""
import asyncio
import subprocess
import os

from events.events import EventsSession

#CONTAINER_NAME = 'hautomation'
CONTAINER_NAME = "hello-world"
CONTAINER_TAG = 'latest'
CONTAINER_REPO = ''
IMAGE_NAME = f"{CONTAINER_REPO}/{CONTAINER_TAG}:{CONTAINER_NAME}"


def run_docker(docker_command: list[str]):
    try:
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
    print("output", stdout)
    print("stderr", stderr)
    print("returncode", returncode)


def pull_container():
    process_output(*run_docker(['docker', 'pull', CONTAINER_NAME]))


def launch_container():
    process_output(*run_docker(["docker", "run", "--rm", IMAGE_NAME, 'run.py helloworld']))


def parse_job_data(json):
    pass


async def main():
    """Async entrypoint to test worker dequeue, looks for SQL_URL
    environment variable to form an initial connection"""
    pull_container()
    sql_url = os.environ.get('SQL_URL', 'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline')
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 1)
    with EventsSession(sql_url, sleep_interval) as session:
        async for event_id, json_data in session.ack_next():
            await session.complete(event_id)
            print(event_id, json_data)
            launch_container()


if __name__ == '__main__':
    asyncio.run(main())
