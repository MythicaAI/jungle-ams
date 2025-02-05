import os
import logging
import asyncio
from  automation.runner import runner_api, RunnerRequest, RunnerResponse
from ripple.automation.worker import Worker
from ripple.automation.utils import format_exception, error_handler
from telemetry import init_telemetry

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

worker = Worker()

if os.environ.get("TELEMETRY_ENABLE", False):
    init_telemetry()

workers = [
    {
        "path": '/mythica/run',
        "provider": runner_api,
        "inputModel": RunnerRequest,
        "outputModel": RunnerResponse
    }
]

def result_listener(result):
    print(f"Result: {result}")

def main():
    worker.start('workflow',workers)        

    loop = asyncio.get_event_loop()        
    task = loop.create_task(worker.nats.listen("result", result_listener()))
    task.add_done_callback(error_handler(log))

    # Run loop until canceled or an exception escapes
    loop.run_forever()

if __name__ == "__main__":
    main()
