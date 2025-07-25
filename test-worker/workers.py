import logging

from automation.hello_world import HelloWorldRequest, HelloWorldResponse, hello_world_api
from meshwork.automation.worker import Worker
from meshwork.config import configure_telemetry, meshwork_config

worker = Worker()

if meshwork_config().telemetry_endpoint:
    configure_telemetry(
        meshwork_config().telemetry_endpoint,
        meshwork_config().telemetry_token,
    )
else:
    logging.basicConfig(level=logging.INFO, format="%(message)s")

workers = [
    {
        "path": '/mythica/generate_job_defs',
        "provider": hello_world_api,
        "inputModel": HelloWorldRequest,
        "outputModel": HelloWorldResponse
    },
    {
        "path": '/mythica/hello_world',
        "provider": hello_world_api,
        "inputModel": HelloWorldRequest,
        "outputModel": HelloWorldResponse
    },
]


def main():
    worker.start('houdini', workers)


if __name__ == "__main__":
    main()
