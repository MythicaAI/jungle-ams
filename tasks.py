# This file is intended for invoke, see README.md for install setup instructions
import re
import os
import subprocess

from invoke import task


COMMIT_HASH = ''


# Control plane variables
CPLN_ORG_NAME = "mythica-main"
CPLN_IMAGE_REPO = f"{CPLN_ORG_NAME}.registry.cpln.io"


# GCS variables
GCS_PROJECT_NAME = "controlnet"
GCS_PROJECT_ID = 407314
GCS_PROJECT = f"{GCS_PROJECT_NAME}-{GCS_PROJECT_ID}"
GCS_REPO_HOST = "us-central1-docker"
GCS_REPO_NAME = "gke-us-central1-images"
GCS_IMAGE_REPO = f"{GCS_REPO_HOST}.pkg.dev/{GCS_PROJECT}/{GCS_REPO_NAME}"


IMAGE_PLATFORM = "linux/amd64"


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# Integration testing directories
TESTING_STORAGE_DIR = os.path.join(BASE_DIR, 'testing/storage')
TESTING_WEB_DIR = os.path.join(BASE_DIR, 'testing/web')


IMAGES = {
    'api/nginx': {'name': 'mythica-web-front'},
    'api/app': {'name': 'mythica-app'},
    'api/publish-init': {'name': 'mythica-publish-init'},
}


def get_commit_hash(ref='HEAD'):
    """Return a short commit hash for the current HEAD commit"""
    result = subprocess.run(
        ["git", "rev-parse", "--short=8", ref],
        stdout=subprocess.PIPE,
        text=True)
    return result.stdout.strip()


def parse_expose_to_ports(image_path):
    """Parse the EXPOSE ports from a Dockerfile"""
    with open(os.path.join(BASE_DIR, image_path, 'Dockerfile'), 'r') as file:
        lines = file.readlines()
    ports = []
    expose_pattern = re.compile(r'^EXPOSE\s+(\d+)(?:\/\w+)?$', re.IGNORECASE)
    for line in lines:
        match = expose_pattern.match(line.strip())
        if match:
            port = match.group(1)
            ports.append(port)
    return ports


def start_docker_compose(c, docker_compose_path):
    """Cleanly start a docker compose instance"""
    with c.cd(docker_compose_path):
        c.run('docker compose down --timeout 1')
        c.run('docker compose -f ./docker-compose.yaml up -d', pty=True)


def stop_docker_compose(c, docker_compose_path):
    """Shutdown a docker compose instance"""
    with c.cd(docker_compose_path):
        c.run('docker compose -f ./docker-compose.yaml down --timeout 3')


def build_image(c, image_path):
    """Build a docker image"""
    image_name = IMAGES[image_path]['name']
    commit_hash = get_commit_hash()
    with c.cd(os.path.join(BASE_DIR, image_path)):
        c.run(f"docker build --platform={IMAGE_PLATFORM} -t {image_name}:latest .", pty=True)
        c.run(f"docker tag {image_name}:latest {image_name}:{commit_hash}", pty=True)


def deploy_image(c, image_path):
    """Deploy a docker image"""
    image_name = IMAGES[image_path]['name']
    commit_hash = get_commit_hash()
    repo = GCS_IMAGE_REPO
    with c.cd(os.path.join(BASE_DIR, image_path)):
        c.run(f"docker tag {image_name}:{commit_hash} {repo}/{image_name}:{commit_hash}", pty=True)
        c.run(f"docker tag {image_name}:{commit_hash} {repo}/{image_name}:latest", pty=True)
        c.run(f"docker push {repo}/{image_name} --all-tags", pty=True)


def run_image(c, image_path, background=False):
    ports = parse_expose_to_ports(image_path)
    port_args = ' '.join([f'-p {port}:{port}' for port in ports])
    image_name = IMAGES[image_path]['name']
    commit_hash = get_commit_hash()
    args = list()
    args.append(port_args)
    args.append('--rm')
    args.append('--network=storage')
    args.append('--network=web')
    if background:
        args.append('--detach')
    else:
        args.append('--interactive --tty')
    c.run(f"docker run {'  '.join(args)} {image_name}:{commit_hash}", pty=True)


@task
def docker_cleanup(c):
    c.run('docker container prune -f')
    c.run('docker image prune -f')


@task
def storage_start(c):
    start_docker_compose(c, TESTING_STORAGE_DIR)


@task
def storage_stop(c):
    stop_docker_compose(c, TESTING_STORAGE_DIR)


@task(help={'container': "Container to tail, defaults to all"})
def storage_tail(c, container=''):
    with c.cd(TESTING_STORAGE_DIR):
        c.run(f'docker compose logs -f {container}', pty=True)


@task(pre=[storage_stop])
def storage_nuke(c):
    answer = input("Continue? Type 'nuke' to confirm: ")
    if answer.upper() in ["NUKE"]:
        os.rmdir(os.path.join(BASE_DIR, 'testing/mnt/pgdata/data'))


@task
def web_start(c):
    start_docker_compose(c, TESTING_WEB_DIR)


@task
def web_stop(c):
    stop_docker_compose(c, TESTING_WEB_DIR)


def image_path_action(c, image, action, **kwargs):
    if image == 'all':
        for image_path in IMAGES.keys():
            action(c, image_path)
    else:
        if image not in IMAGES:
            c.help(f'{image} not in {IMAGES.keys()}')
            return
        action(c, image, **kwargs)


@task(help={'image': f'Image path to build: {IMAGES.keys()}'})
def docker_build(c, image='all'):
    image_path_action(c, image, build_image)


@task(help={'image': f'Image path to build in: {IMAGES.keys()}'})
def docker_deploy(c, image='all'):
    image_path_action(c, image, deploy_image)


@task(help={
    'image': f'Image path to run: {IMAGES.keys()}',
    'background': f'Run the image in the background'})
def docker_run(c, image='api/app', background=False):
    image_path_action(c, image, run_image, background=background)
