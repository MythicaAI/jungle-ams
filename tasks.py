# This file is intended for invoke, see README.md for install setup instructions
from dotenv import dotenv_values
import os
import re
import subprocess
from datetime import datetime, timezone
from functools import wraps
from os import PathLike
from pathlib import Path

from invoke import task

COMMIT_HASH = ''
PTY_SUPPORTED = os.name != 'nt'

#
# Control plane variables
#
CPLN_ORG_NAME = "mythica-main"
CPLN_IMAGE_REPO = f"{CPLN_ORG_NAME}.registry.cpln.io"

#
# GCS variables
#
GCS_PROJECT_NAME = "controlnet"
GCS_PROJECT_ID = 407314
GCS_PROJECT = f"{GCS_PROJECT_NAME}-{GCS_PROJECT_ID}"
GCS_REPO_HOST = "us-central1-docker"
GCS_REPO_NAME = "gke-us-central1-images"
GCS_IMAGE_REPO = f"{GCS_REPO_HOST}.pkg.dev/{GCS_PROJECT}/{GCS_REPO_NAME}"

IMAGE_PLATFORM = "linux/amd64"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

#
# Houdini variables
#
SFX_CLIENT_ID = os.environ.get('SFX_CLIENT_ID')
SFX_CLIENT_SECRET = os.environ.get('SFX_CLIENT_SECRET')

#
# AUTHKEYS
#
HF_AUTHTOKEN = os.environ.get('HF_AUTHTOKEN')

#
# ENV for node builds
#
NODE_ENV = os.environ.get('NODE_ENV', 'dev')

#
# Integration testing directories
#
TESTING_STORAGE_DIR = os.path.join(BASE_DIR, 'testing/storage')
TESTING_WEB_DIR = os.path.join(BASE_DIR, 'testing/web')
TESTING_AUTO_DIR = os.path.join(BASE_DIR, 'testing/automation')
TESTING_OBSERVE_DIR = os.path.join(BASE_DIR, 'testing/observe')
TESTING_MNT_DIR = os.path.join(BASE_DIR, 'testing/mnt')

IMAGES = {
    'api/nginx': {},
    'api/app': {
        'requires': ['libs/python'],
    },
    'libs/python': {},
    'api/publish-init': {},
    'api/lets-encrypt': {},
    'api/gcs-proxy': {},
    'api/packager': {
        'requires': ['api/app', 'libs/python'],
    },
    'api/canary': {},
    'api/bulk-import': {},
    'sites/jungle3': {
        'buildargs': {
            'NODE_ENV': NODE_ENV,
        }
    },
    'sites/editor': {
        'buildargs': {
            'NODE_ENV': NODE_ENV,
        }
    },
    'sites/awful-ui': {
        'buildargs': {
            'NODE_ENV': NODE_ENV,
        }
    },
    'testing/storage/minio-config': {},
    'automation/test': {
        'requires': ['libs/python'],
    },
    'automation/blender': {
        'requires': ['libs/python'],
    },
    'automation/genai': {
        'requires': ['libs/python'],
        'buildargs': {
            'HF_AUTHTOKEN': HF_AUTHTOKEN,
        },
    },
    'automation/houdini': {
        'requires': ['libs/python'],
        'buildargs': {
            'SFX_CLIENT_ID': SFX_CLIENT_ID,
            'SFX_CLIENT_SECRET': SFX_CLIENT_SECRET,
        },
    },
    'automation/imagemagick': {
        'requires': ['libs/python'],
    }
}

SITE_DATA = {
    'sites/jungle3',
    'sites/awful-ui',
    'sites/editor',
}

WEB_SERVING = {
    'api/nginx',
    'api/app',
    'api/publish-init',
    'api/lets-encrypt',
    'api/gcs-proxy',
    'api/canary',
}

IMAGE_SETS = {
    'all': set(IMAGES.keys()),
    'sites': SITE_DATA,
    'web': SITE_DATA | WEB_SERVING,
    'storage': {
        'testing/storage/minio-config'},
    'auto': {
        'automation/houdini',
        'automation/genai',
        'automation/test',
        'automation/blender',
        'api/packager'
    },
}

LOCAL_MOUNT_POINTS = {
    'objstore': 'testing/mnt/objstore',
    'pgdata': 'testing/mnt/pgdata',
    'static': 'testing/mnt/static',
    'nats': 'testing/mnt/nats',
}


def get_git_tags(prefix):
    """Get git tags matching prefix, sorted by version."""
    result = subprocess.run(['git', 'tag', '-l', prefix, '--sort=-v:refname'],
                            capture_output=True, text=True)
    return result.stdout.strip().split('\n')


def parse_dockerfile_label_name(dockerfile_path: PathLike) -> str:
    """Extract the name label from Dockerfile."""
    with open(dockerfile_path, "r") as f:
        content = f.read()
        match = re.search(r'LABEL\s+name=["\'](.*?)["\']', content)
        if match:
            return match.group(1)
    raise ValueError(f"LABEL name= not found in {dockerfile_path}")


def generate_mount_env_file() -> str:
    """Generate an env file with the OS specific mount points as environment variables"""
    env_file_path = os.path.join(TESTING_MNT_DIR, 'os_mount_paths.env')

    # Load local .env variables if the file exists
    local_env_path = os.path.join(BASE_DIR, 'testing/.env')
    local_env = dotenv_values(local_env_path) if os.path.exists(local_env_path) else {}
    
    with open(env_file_path, "w+") as f:
        for name, mnt_point in LOCAL_MOUNT_POINTS.items():
            abs_path = os.path.join(BASE_DIR, mnt_point)
            # Convert to platform-specific format
            abs_path = os.path.normpath(abs_path)
            # Write env var in KEY=value format
            f.write(f"{name.upper()}_PATH={abs_path}\n")
        # Write variables from .env file
        for key, value in local_env.items():
            f.write(f"{key}={value}\n")
    return os.path.normpath(env_file_path)


def get_commit_hash(ref='HEAD'):
    """Return a short commit hash for the current HEAD commit"""
    result = subprocess.run(
        ["git", "rev-parse", "--short=8", ref],
        stdout=subprocess.PIPE,
        text=True)
    return result.stdout.strip()


def parse_expose_to_ports(dockerfile_path: PathLike):
    """Parse the EXPOSE ports from a Dockerfile"""
    with open(dockerfile_path, 'r') as file:
        lines = file.readlines()
    ports = []
    expose_pattern = re.compile(r'^EXPOSE\s+(\d+)(?:\/\w+)?$', re.IGNORECASE)
    for line in lines:
        match = expose_pattern.match(line.strip())
        if match:
            port = match.group(1)
            ports.append(port)
    return ports


def start_docker_compose(c, docker_compose_path, cleanup_fn=None):
    """Cleanly start a docker compose instance"""
    env_file_path = generate_mount_env_file()
    with c.cd(docker_compose_path):
        c.run(f'docker compose --env-file {env_file_path} down --timeout 1')
        # cleanup_fn(c) if cleanup_fn is not None else None
        c.run(f'docker compose --env-file {env_file_path} -f ./docker-compose.yaml up -d',
              pty=PTY_SUPPORTED)


def stop_docker_compose(c, docker_compose_path):
    """Shutdown a docker compose instance"""
    env_file_path = generate_mount_env_file()
    with c.cd(docker_compose_path):
        c.run(
            f'docker compose --env-file {env_file_path} -f ./docker-compose.yaml down --timeout 3')


def build_image(c, image_path: PathLike, no_cache: bool = False, use_tailscale: bool = False):
    """Build a docker image"""

    working_directory = Path(BASE_DIR) / image_path
    dockerfile_path = working_directory / 'Dockerfile'
    parse_expose_to_ports(dockerfile_path)

    image_name = parse_dockerfile_label_name(dockerfile_path)
    requires = IMAGES[image_path].get('requires')
    if requires is not None:
        for image in requires:
            build_image(c, image, use_tailscale=use_tailscale)

    buildarg_str = ''
    buildargs = IMAGES[image_path].get('buildargs')
    if use_tailscale:
        if buildargs is None:
            buildargs = {}
        buildargs.update({"NATS_ENDPOINT": "nats://nats.nats.svc.cluster.local:4222"})
    if buildargs is not None:
        buildarg_str = ' '.join(
            [f'--build-arg {key}={value}' for key, value in buildargs.items()])

    commit_hash = get_commit_hash()
    with c.cd(working_directory):
        c.run(
            (f"docker buildx build --platform={IMAGE_PLATFORM}"
             f" {buildarg_str} -f {dockerfile_path}"
             f'{" --no-cache" if no_cache else ""}'
             f"  -t {image_name}:latest ."),
            pty=PTY_SUPPORTED)
        c.run(f'docker tag {image_name}:latest {image_name}:{commit_hash}',
              pty=PTY_SUPPORTED)


def deploy_image(c, image_path, target):
    """Deploy a docker image"""
    working_directory = Path(BASE_DIR) / image_path
    dockerfile_path = working_directory / 'Dockerfile'
    image_name = parse_dockerfile_label_name(dockerfile_path)
    commit_hash = get_commit_hash()
    if target == "gcs":
        repo = GCS_IMAGE_REPO
    elif target == "cpln":
        repo = CPLN_IMAGE_REPO
    else:
        raise ValueError(f"unknown deployment target {target}")

    with c.cd(os.path.join(BASE_DIR, image_path)):
        c.run((f"docker tag {image_name}:{commit_hash}"
               f" {repo}/{image_name}:{commit_hash}"),
              pty=PTY_SUPPORTED)
        c.run((f"docker tag {image_name}:{commit_hash}"
               f" {repo}/{image_name}:latest"),
              pty=PTY_SUPPORTED)
        c.run(f"docker push {repo}/{image_name}:latest",
              pty=PTY_SUPPORTED)
        c.run(f"docker push {repo}/{image_name}:{commit_hash}",
              pty=PTY_SUPPORTED)


def run_image(c, image_path: PathLike, background=False):
    """Run a docker image by path"""
    working_directory = Path(BASE_DIR) / image_path
    dockerfile_path = working_directory / 'Dockerfile'
    image_name = parse_dockerfile_label_name(dockerfile_path)
    ports = parse_expose_to_ports(dockerfile_path)
    port_args = ' '.join([f'-p {port}:{port}' for port in ports])
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
    c.run(f"docker run {'  '.join(args)} {image_name}:{commit_hash}",
          pty=PTY_SUPPORTED)


def copy_dist_files(c, image_path):
    """
    Given a dist files image (image that built some distribution into /dist)
    copy the files to a local directory from the container to make
    them available for serving or moving to the next distribution point
    """
    dockerfile_path = Path(image_path) / 'Dockerfile'
    image_name = parse_dockerfile_label_name(dockerfile_path)
    commit_hash = get_commit_hash()
    source_path = '/dist'

    # Create the container from the build image
    result = c.run(f"docker create {image_name}:{commit_hash}", hide=True)
    container_id = result.stdout.strip()
    destination_path = os.path.join(BASE_DIR, image_path, 'dist-build')
    try:
        # Step 2: Copy files from the temporary
        # container to the local filesystem
        print((f"Copying '{source_path}' from container"
               f" to '{destination_path}'..."))
        c.run(f"docker cp {container_id}:{source_path} {destination_path}")
        print("Files copied successfully.")
    finally:
        # Step 3: Remove the temporary container
        print(f"Removing temporary container '{container_id}'...")
        c.run(f"docker rm {container_id}", hide=True)
        print("Temporary container removed.")


def timed(func):
    """Decorator to time invoke tasks and log their execution times."""

    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = datetime.now(timezone.utc)
        result = func(*args, **kwargs)
        end_time = datetime.now(timezone.utc)

        duration = end_time - start_time
        task_name = func.__name__
        print(f"{task_name}: completed in {duration.seconds} seconds")
        return result

    return wrapper


@task
def docker_cleanup(c):
    """Cleanup docker artifacts"""
    c.run('docker container prune -f')
    c.run('docker image prune -f')
    c.run('docker builder prune')
    c.run('docker system prune -a')


@task
def storage_start(c, use_tailscale: bool = False):
    """Start storage tier components"""
    print("Use flag -u or --use_tailscale to connect storage to remote NATS")
    start_docker_compose(c, TESTING_STORAGE_DIR)
    if use_tailscale:
        with c.cd(TESTING_STORAGE_DIR):
            c.run("docker compose stop nats", pty=True)


@task
def storage_stop(c):
    """Stop storage tier components"""
    stop_docker_compose(c, TESTING_STORAGE_DIR)


@task(help={'container': "Container to tail, defaults to all"})
def storage_tail(c, container=''):
    """Tail logs of storage components"""
    with c.cd(TESTING_STORAGE_DIR):
        c.run(f'docker compose logs -f {container}', pty=PTY_SUPPORTED)


@task(pre=[storage_stop])
def storage_nuke(c):
    """Nuke docker storage for a clean start"""
    answer = input("Continue? Type 'nuke' to confirm: ")
    if answer.upper() in ["NUKE"]:
        os.rmdir(os.path.join(BASE_DIR, 'testing/mnt/pgdata/data'))


@task
def cleanup_web_dist(c):
    """Remove the dist volume used by the docker compose web service"""
    c.run('docker volume rm web_dist', pty=PTY_SUPPORTED)


@task
def web_start(c):
    """Start web tier components"""
    start_docker_compose(c, TESTING_WEB_DIR, cleanup_web_dist)


@task(post=[cleanup_web_dist])
def web_stop(c):
    """Stop web tier components"""
    stop_docker_compose(c, TESTING_WEB_DIR)


@task
def auto_start(c):
    """Start automation tier components"""
    start_docker_compose(c, TESTING_AUTO_DIR)


@task
def auto_stop(c):
    """Stop automation tier components"""
    stop_docker_compose(c, TESTING_AUTO_DIR)


@task
def observe_start(c):
    """Start observability tier components"""
    start_docker_compose(c, TESTING_OBSERVE_DIR, cleanup_web_dist)


@task(post=[cleanup_web_dist])
def observe_stop(c):
    """Stop observability tier components"""
    stop_docker_compose(c, TESTING_OBSERVE_DIR)


def image_path_action(c, image, action, **kwargs):
    """
    Execute some docker image action against an image path
    or set of image paths
    """
    # remove preceding and trailing slashes
    if image.startswith('/'):
        image = image[1:]
    if image.endswith('/'):
        image = image.rstrip('/')

    if image in IMAGE_SETS:
        for image_path in IMAGE_SETS[image]:
            action(c, image_path, **kwargs)
    else:
        if image not in IMAGES:
            raise ValueError(f'{image} not in {IMAGES.keys()}')
        action(c, image, **kwargs)


@task(help={'image': f'Image path to build: {IMAGES.keys()}'})
@timed
def docker_build(c, image='all', no_cache: bool = False, use_tailscale: bool = False):
    """Build a docker image by sub path or set name"""
    image_path_action(c, image, build_image, no_cache=no_cache, use_tailscale=use_tailscale)


@task(help={'image': f'Image path to build in: {IMAGES.keys()}'})
@timed
def docker_deploy(c, image='all', target='gcs', no_cache: bool = False):
    """Deploy a docker image by sub path set name"""
    image_path_action(c, image, build_image, no_cache=no_cache)
    image_path_action(c, image, deploy_image, target=target)


@task(help={
    'image': f'Image path to run: {IMAGES.keys()}',
    'background': 'Run the image in the background'})
@timed
def docker_run(c, image='api/app', background=False):
    """Run a docker image by path"""
    image_path_action(c, image, run_image, background=background)
