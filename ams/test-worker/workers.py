import logging
from  automation.hello_world import hello_world_api, HelloWorldRequest, HelloWorldResponse
from ripple.automation.worker import Worker

from ripple.config import configure_telemetry, ripple_config


worker = Worker()

if ripple_config().telemetry_enable:
    configure_telemetry(
        ripple_config().telemetry_endpoint,
        ripple_config().telemetry_insecure,
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
    worker.start('houdini',workers)        

if __name__ == "__main__":
    main()
