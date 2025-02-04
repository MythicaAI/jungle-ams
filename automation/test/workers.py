import os
from  automation.hello_world import hello_world_api, HelloWorldRequest, HelloWorldResponse
from ripple.automation.worker import Worker

from ripple.config import configure_telemetry

worker = Worker()

if os.environ.get("TELEMETRY_ENABLE", False):
    configure_telemetry(
        os.getenv("TELEMETRY_ENDPOINT", "http://otel-collector.default:4317"),
        os.getenv("TELEMETRY_INSECURE", "true") == "true",
    )

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
