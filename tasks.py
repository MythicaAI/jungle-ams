# This file is intended for invoke, see README.md for install setup instructions
import os
from invoke import task


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


TESTING_STORAGE_DIR = os.path.join(BASE_DIR, 'testing/storage')
TESTING_WEB_DIR = os.path.join(BASE_DIR, 'testing/web')


def start_docker_compose(c, docker_compose_path):
    with c.cd(docker_compose_path):
        c.run('docker compose down --timeout 1')
        c.run('docker compose -f ./docker-compose.yaml up -d', pty=True)


def stop_docker_compose(c, docker_compose_path):
    with c.cd(docker_compose_path):
        c.run('docker compose -f ./docker-compose.yaml down --timeout 3')


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


@task
def web_start(c):
    start_docker_compose(c, TESTING_WEB_DIR)


@task
def web_stop(c):
    stop_docker_compose(c, TESTING_WEB_DIR)

