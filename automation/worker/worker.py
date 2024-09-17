import json
import sys
import os
import requests
import importlib
import aiohttp
from prometheus_fastapi_instrumentator import Instrumentator
import logging
import asyncio
from munch import munchify
from nats.aio.client import Client as NATS
from http import HTTPStatus
from pathlib import Path
from pydantic import BaseModel, ValidationError
from typing import Callable, Type, Optional, Dict

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)


###
# Containers using this worker module should define a workers.py module
# that exports a single member, `workers`.
# ```
# workers = [WorkerModel]
# ``` 
# Work packages passed to a worker should have a path that can be mapped
# to one of the worker's `WorkerModel` paths. 
###
class WorkerModel(BaseModel):
    path: str
    provider: Callable
    inputModel: Type[BaseModel]

workers:dict[str,WorkerModel] = {}

def load_workers():
    """Function to dynamically discover and register workers in a container"""
    worker_path = './workers.py'
    if os.path.exists(worker_path):
        try:
            log.debug(f'Start Registering workers')
            # Dynamically import the module from the 'automation' directory
            module = importlib.import_module("workers")
            # Get the 'workers' from the module and include it in the FastAPI app
            my_workers = getattr(module, 'workers')
            for worker in my_workers:
                r = WorkerModel(**worker)
                workers[r.path] = r
                log.debug(f"Registered worker for '{r.path}'")
            log.debug(f'End Registering workers')
        except Exception as e:
            log.error(f'Failed to register workers: {e}')
    else:
        log.error('workers.py could not be found. Nothing to do!')
 
###
# Request and Response model used for worker messages..
# Workers expect messages to satisfy the WorkerRequest contract
# Return messages will satisfy the WorkerResponse contract 
###
class WorkerRequest(BaseModel):
    """Contract for requests for work"""
    work_id: str
    job_id: Optional[str] = None  # job_id is optional
    path: str
    data: Dict

class WorkerResponse(WorkerRequest):
    """Contract for responses to work requess"""
    result_data: Dict   


def schedule_task(task_def):
    """Houdini has an event loop already running so we need to work around it"""
    try:
        loop =asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(task_def())
        else:
            loop.run_until_complete(task_def())
    except RuntimeError:
        asyncio.run(task_def())


def send_to_nats(subject: str, data: dict):
    """Post data to NATS on subject. """
    async def send_message():
        log.debug(f"Sending to NATS: {subject} - {data}" )
            
        nc = NATS()
        try:
            #TODO: Externalize
            await nc.connect("nats://nats.nats:4222")
            await nc.publish(subject, json.dumps(data).encode())
            await nc.flush()
            log.debug(f"Sent to NATS")
        except Exception as e:
            log.error(f"Sending to NATS failed: {subject} - {data} - {e}")
        finally:
            await nc.close()

    schedule_task(send_message)


def send_to_endpoint(endpoint: str, data: dict=None):
    """Post data to an endpoint. """

    # Define the asynchronous version of the function
    async def send_message():
        async with aiohttp.ClientSession() as session:
            log.debug(f"Sending to Endpoint: {endpoint} - {data}" )
            async with session.post(
                        endpoint, 
                        json=json.dumps(data), 
                        headers={"Content-Type": "application/json"}) as post_result:
                if post_result.status in [200,201]:
                    log.debug(f"Endpoint Response: {post_result.status}")
                else:
                    log.error(f"Failed to call job API: {endpoint} - {data} - {post_result.status}")

    schedule_task(send_message)

def run_worker(json_payload: str):
    """
    Execute a work unit by trying to find a route that maps
    to the path defined in the payload. If a route is defined,
    data is sent to the route provider, along with a callback for 
    reporting status
    """

    #Parse the json_payload
    try:
        parsed_payload = json.loads(json_payload)

        #TODO: We need to resolve file params in the payload.data field
        payload = WorkerRequest(**parsed_payload)

        log_str = f"work_id:{payload.work_id}, work:{payload.path}, job_id: {payload.job_id}, data: {payload.data}"

        #TODO: These should be defined elsewhere.
        JOB_RESULT_ENDPOINT=f"https://api.mythica.ai/v1/jobs/results/{payload.job_id}"
        JOB_COMPLETE_ENDPOINT=f"https://api.mythica.ai/v1/jobs/complete/{payload.job_id}"

    except Exception as e:
        msg=f'Error parsing payload - {json_payload} - {str(e)}'
        send_to_nats("result", {'status': msg })
        #Cannot report to endpoint as message could not be parsed
        log.error(f"Validation error: {msg}")
        return 
        

    #Callback for reporting back. 
    #TODO: This needs to be moved to a library for typing
    def report_result(result_data: dict, complete=False):
        log.info(f"Job {'Result' if not complete else 'Complete'} - {log_str} -> {result_data}")

        #TODO: We need to unresolve file params in the result_data field and externalize the "result" channel
        send_to_nats("result", {
            **payload.model_dump(),
            'result_data': result_data 
        })
        if payload.job_id:
            if complete:
                send_to_endpoint(JOB_COMPLETE_ENDPOINT)
            else:
                send_to_endpoint(JOB_RESULT_ENDPOINT, result_data)
            

    #Run the worker
    try:
        report_result({'status': 'started'})

        worker = workers[payload.path] 
        inputs = worker.inputModel(**payload.data)
        worker.provider(inputs, report_result)

        report_result({'status': 'complete'}, complete=True)

    except Exception as e:
        log.error(f"Executor error - {log_str} - {e}")
        report_result({
            'status': 'error',
            'message': str(e)
        })
        



def initialize():
    """Empty function to force routes to preload and cache checkpoints in the image."""
    try:
        log.info("Initialization tasks completed successfully.")
    except Exception as e:
        log.error(f"Initialization failed: {e}")
        sys.exit(1)
    sys.exit(0)

def main():
    load_workers()  # Dynamically load routes at startup
    
    if len(sys.argv) != 2:
        log.warning("Usage: python worker.py '<json_payload>'")
    elif sys.argv[1] == "initialize":
        initialize()
    else:
        run_worker(sys.argv[1])
        

if __name__ == "__main__":
    main()

# kubectl exec -n nats -it deployment/nats-box -- nats pub test '{"work_id": "test-this-work", "path": "/mythica/hello_world", "data": {"message":"Hello World!"}}'
# kubectl exec -n nats -it deployment/nats-box -- nats pub houdini '{"job_path": "/mythica/hello_world", "data": {"message":"Hello Cruel World"},"result_url":"d","complete_url":"d"}
