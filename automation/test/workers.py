import os
from  automation.hello_world import hello_world_api, HelloWorldRequest, HelloWorldResponse
from ripple.automation.worker import Worker

from telemetry import init_telemetry


worker = Worker()

if os.environ.get("TELEMETRY_ENABLE", False):
    init_telemetry()

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
