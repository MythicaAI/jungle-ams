# This file is intended for invoke, see README.md for install setup instructions

from invoke import task


testing_storage_dir = 'testing/storage'
testing_web_dir = 'testing/web'


def start_docker_compose(c, docker_compose_path):
    with c.cd(docker_compose_path):
        c.run('docker compose down --timeout 1')
        c.run('docker compose -f ./docker-compose.yml up -d', pty=True)


def stop_docker_compose(c, docker_compose_path):
    with c.cd(testing_storage_dir):
        c.run('docker compose down --timeout 3')


@task
def docker_cleanup(c):
    c.run('docker container prune -f')
    c.run('docker image prune -f')


@task
def storage_start(c):
    start_docker_compose(c, testing_storage_dir)


@task
def storage_stop(c):
    stop_docker_compose(c, testing_storage_dir)


@task(help={'container': "Container to tail, defaults to all"})
def storage_tail(c, container=''):
    with c.cd(testing_storage_dir):
        c.run(f'docker compose logs -f {container}', pty=True)


@task
def web_start(c):
    start_docker_compose(c, testing_web_dir)


@task
def web_stop(c):
    stop_docker_compose(c, testing_web_dir)

