import json
import os
import logging
import traceback
import asyncio
import nats
import requests
import tempfile
from pydantic import BaseModel
from typing import Callable, Type, Optional, Dict, Any, Literal
from ripple.models.params import ParameterSet
from ripple.models.streaming import ProcessStreamItem, OutputFiles, Progress, Message, JobDefinition
from ripple.runtime.params import resolve_params
from uuid import uuid4

import subprocess
import sys
from pathlib import Path
import venv

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

def formatException(e):
    return f" {str(e)}\n{traceback.format_exc()}"

NATS_URL= 'nats://nats.nats:4222'
API_URL= 'https://api.mythica.ai/v1'

class NatsAdapter():
    def __init__(self, nats_url=NATS_URL) -> None:
        self.nats_url = nats_url
        self.listeners = {}
        self.nc = None  # Single NATS client connection

    async def _connect(self):
        """Establish a connection to NATS."""
        if not self.nc:
            log.debug("Connecting to NATS")
            self.nc = await nats.connect(servers=[self.nats_url])
            log.info("Connected to NATS")


    async def _disconnect(self):
        """Disconnect from NATS gracefully."""
        if self.nc:
            log.debug("Disconnecting from NATS")
            await self.nc.drain()  # Gracefully stop receiving messages
            self.nc = None
            log.info("Disconnected from NATS")

    async def post(self, subject: str, data: dict) -> None:
        """Post data to NATS on subject. """
        await self._connect()                
        try:
            log.debug(f"Sending to NATS: {subject} - {data}" )
            await self.nc.publish(subject, json.dumps(data).encode())
            log.debug(f"Sent to NATS")
        except Exception as e:
            log.error(f"Sending to NATS failed: {subject} - {data} - {formatException(e)}")
        finally:
            if not self.listeners:
                await self._disconnect()


    async def listen(self, subject: str, callback: callable):
        if subject in self.listeners:
            log.warning(f"NATS listener already active for subject {subject}")
            return

        """ Listen to NATS """
        await self._connect()

        async def message_handler(msg):
            try:
                payload = json.loads(msg.data.decode('utf-8'))
                log.info(f"Received message on {subject}: {payload}")
                await callback(payload)
            except Exception as e:
                log.error(f"Error processing message on {subject}: {formatException(e)}")

        try:
        
            # Wait for the response with a timeout (customize as necessary)
            log.debug("Setting up NATS response listener")
            listener = await self.nc.subscribe(subject,queue="worker", cb=message_handler)
            self.listeners[subject] = listener
            log.info("NATS response listener set up")

        except Exception as e:
            log.error(f"Error setting up listener for subject {subject}: {formatException(e)}")
            raise e

    async def unlisten(self, subject: str):

        """Shut down the listener for a specific subject."""
        if subject in self.listeners:
            log.debug(f"Shutting down listener for subject {subject}")
            subscription = self.listeners.pop(subject)
            await subscription.unsubscribe()
            log.info(f"Listener for subject {subject} shut down")
            if not self.listeners:
                await self._disconnect()
                log.info(f"Last Listener was shut down. Closing Connection")
        else:
            log.warning(f"No active listener found for subject {subject}")


class RestAdapter():
    def __init__(self, api_url=API_URL) -> None:
        self.api_url = api_url

    def get(self, endpoint: str, data: dict={}) -> Optional[str]:
        """Get data from an endpoint."""
        url = API_URL + endpoint
        log.debug(f"Getting from Endpoint: {url} - {data}" )
        response = requests.get(url)
        if response.status_code in [200,201]:
            log.debug(f"Endpoint Response: {response.status_code}")
            return response.json()
        else:
            log.error(f"Failed to call job API: {url} - {data} - {response.status_code}")
            return None

    def post(self, endpoint: str, data: str) -> Optional[str]:
        """Post data to an endpoint synchronously. """
        url = API_URL + endpoint
        log.debug(f"Sending to Endpoint: {endpoint} - {data}" )
        response = requests.post(
            url, 
            json=data, 
            headers={"Content-Type": "application/json"}
        )
        if response.status_code in [200,201]:
            log.debug(f"Endpoint Response: {response.status_code}")
            return response.json()
        else:
            log.error(f"Failed to call job API: {url} - {data} - {response.status_code}")
            return None

    def post_file(self, endpoint: str, token: str, file_data: list) -> Optional[str]:
        """Post file to an endpoint."""
        url = API_URL + endpoint
        log.debug(f"Sending file to Endpoint: {url} - {file_data}" )
        response = requests.post(
            url, 
            files=file_data, 
            headers={"Authorization": "Bearer %s" % token}
        )
        if response.status_code in [200,201]:
            log.debug(f"Endpoint Response: {response.status_code}")
            return response.json()
        else:
            log.error(f"Failed to call job API: {url} - {file_data} - {response.status_code}")
            return None

class WorkerModel(BaseModel):
    path: str
    provider: Callable
    inputModel: Type[ParameterSet]
    outputModel: Type[ProcessStreamItem]
    hidden: bool = False

class WorkerRequest(BaseModel):
    """Contract for requests for work"""
    work_id: str
    job_id: Optional[str] = None
    profile_id: Optional[str] = None
    path: str
    data: Dict

class WorkerResponse(BaseModel):
    work_id: str
    payload: dict


class ResultPublisher:
    request: WorkerRequest
    nats: NatsAdapter
    rest: RestAdapter
    
    def __init__(self, request: WorkerRequest, nats: NatsAdapter, rest: RestAdapter) -> None:
        self.request = request
        self.nats = nats
        self.rest = rest
        
    #Callback for reporting back. 
    def result(self, item, complete=False):

        # Poplulate context
        item.process_guid = str(uuid4())
        item.job_id = self.request.job_id if self.request.job_id is not None else ""

        # Upload any references to local data
        self._publish_local_data(item)


   
        JOB_RESULT_ENDPOINT="/jobs/results/"
        JOB_COMPLETE_ENDPOINT="/jobs/complete/"

        # Publish results
        log.info(f"Job {'Result' if not complete else 'Complete'} -> {item}")

        task = asyncio.create_task(
            self.nats.post(
                "result", 
                WorkerResponse(work_id=self.request.work_id, payload=item.model_dump()).model_dump()
            )
        )
        
        task.add_done_callback(_get_error_handler())
        if self.request.job_id:
            if complete:
                self.rest.post(f"{JOB_COMPLETE_ENDPOINT}/{self.request.job_id}", "")
            else:
                data = {
                    "created_in": "automation-worker",
                    "result_data": item.model_dump()
                }
                self.rest.post(f"{JOB_RESULT_ENDPOINT}/{self.request.job_id}", data)

    def _publish_local_data(self, item: ProcessStreamItem):


        def upload_file(token: str, file_path: str) -> Optional[str]:
            if not os.path.exists(file_path):
                return None

            file_id = None
            try:
                with open(file_path, 'rb') as file:
                    file_name = os.path.basename(file_path)
                    file_data = [('files', (file_name, file, 'application/octet-stream'))]
                    response = self.rest.post_file("/upload/store", token, file_data)
                    file_id = response['files'][0]['file_id'] if response else None
                return file_id
            finally:
                os.remove(file_path)

        def upload_job_def(job_def: JobDefinition) -> Optional[str]:
            definition = {
                'job_type': job_def.job_type,
                'name': job_def.name,
                'description': job_def.description,
                'params_schema': job_def.parameter_spec.dict()
            }
            response = self.rest.post("/jobs/definitions", definition)
            return response['job_def_id'] if response else None

        #TODO: Report errors
        if isinstance(item, OutputFiles):
            url = f"/sessions/direct/{self.request.profile_id}"
            response = self.rest.get(url)
            token = response['token'] if response else None

            for key, files in item.files.items():
                for index, file in enumerate(files):
                    file_id = upload_file(token, file)
                    files[index] = file_id

        elif isinstance(item, JobDefinition):
            job_def_id = upload_job_def(item)
            if job_def_id != None:
                item.job_def_id = job_def_id


def _get_error_handler():
    def handler(task):
        e = task.exception()
        if e:
            log.error(f"Error publishing result: {formatException(e)}")
    return handler

class Worker:
    def __init__(self) -> None:
        self.workers:dict[str,WorkerModel] = {}
        self.nats = NatsAdapter()
        self.rest = RestAdapter()

    class CatalogResponse(ProcessStreamItem):
        item_type: Literal["catalogResponse"] = "catalogResponse"
        workers: Dict[str, Dict[Literal["input", "output", "hidden"], Any]]

    def _get_catalog_provider(self) -> Callable:
        worker = self
        
        def impl(request: ParameterSet = None, responder: ResultPublisher=None) -> Worker.CatalogResponse:
            ret = {}
            for path,wk in worker.workers.items():
                ret.update({
                    path: {
                        "input": wk.inputModel.model_json_schema(),
                        "output": wk.outputModel.model_json_schema(),
                        "hidden": wk.hidden                   
                    }
                })
                        
            return Worker.CatalogResponse(workers=ret)
        return impl

    class ScriptRequest(ParameterSet):
        script: str
        request_data: ParameterSet = None

    def _get_script_worker(self) -> Callable:
        doer = self
        def impl(request: Worker.ScriptRequest = None, responder: ResultPublisher = None) -> ProcessStreamItem:
            # Prepare the environment to hold the script's namespace
            script_namespace = {}
            if not request.request_data:
                raise ValueError("request_data is required.")

            # Execute the script directly in the current environment
            exec(request.script, script_namespace)

            # Prepare request model from request_data
            if "RequestModel" in script_namespace and callable(script_namespace["RequestModel"]):
                request_model = script_namespace["RequestModel"](**request.request_data.model_dump())
            else:
                raise ValueError("RequestModel not found in script.")

            resolve_params(API_URL, doer.tmpdir, request_model)

            # Run the automation function
            if "runAutomation" in script_namespace and callable(script_namespace["runAutomation"]):
                result = script_namespace["runAutomation"](request_model, responder)
            else:
                raise ValueError("runAutomation function not found in script.")

            # Ensure ProcessStreamItem response and return it as payload
            if isinstance(result, ProcessStreamItem):
                return result
            else:
                raise ValueError("runAutomation did not return a ProcessStreamItem.")

        return impl

    def _get_script_interface(self) -> Callable:
        def impl(request: Worker.ScriptRequest = None, responder: ResultPublisher = None) -> ProcessStreamItem: 
            script_namespace = {}

            try:
                exec(request.script, script_namespace)

                input = None
                output = None
                # Prepare request model from request_data
                if "RequestModel" in script_namespace and callable(script_namespace["RequestModel"]):
                    input = script_namespace["RequestModel"]
                else:
                    raise ValueError("RequestModel not found in script.")
                
                if "ResponseModel" in script_namespace and callable(script_namespace["ResponseModel"]):
                    output = script_namespace["ResponseModel"]
                else:
                    output = ProcessStreamItem
                

                return Worker.CatalogResponse(
                    workers={
                        '/mythica/script': {
                            'input': input.model_json_schema(),
                            'output': output.model_json_schema(),
                            'hidden': True
                    }
                })
            except Exception as e:
                responder.result(Message(message=f"Script Interface Generation Error: {formatException(e)}"))

            return(Worker.CatalogResponse(workers={}))
        return impl
    
    def start(self,subject: str, workers:list[dict]) -> None:
        path='/mythica/workers'
        workers.append({
            'path':path,
            'provider': self._get_catalog_provider(),
            'inputModel': ParameterSet,
            'outputModel': Worker.CatalogResponse,
            'hidden': True
        })
        path='/mythica/script'
        workers.append({
            'path':path,
            'provider': self._get_script_worker(),
            'inputModel': Worker.ScriptRequest,
            'outputModel': ProcessStreamItem
        })
        path='/mythica/script/interface'
        workers.append({
            'path':path,
            'provider': self._get_script_interface(),
            'inputModel': Worker.ScriptRequest,
            'outputModel': Worker.CatalogResponse,
            'hidden': True
        })

        self._load_workers(workers)

        loop = asyncio.get_event_loop()        
        task = loop.create_task(self.nats.listen(subject, self._get_executor()))
        task.add_done_callback(_get_error_handler())

        try:
            loop.run_forever()
        except KeyboardInterrupt:
            log.info("Received exit signal. Shutting down...")
            loop.stop()

    def _load_workers(self,workers):
        """Function to dynamically discover and register workers in a container"""
        try:
            log.debug(f'Start Registering workers')
            for worker in workers:
                model = WorkerModel(**worker)
                self.workers[model.path] = model
                log.debug(f"Registered worker for '{model.path}'")
            log.debug(f'End Registering workers')
        except Exception as e:
            log.error(f'Failed to register workers: {formatException(e)}')

    def _get_executor(self):
        """
        Execute a work unit by trying to find a route that maps
        to the path defined in the payload. If a route is defined,
        data is sent to the route provider, along with a callback for 
        reporting status
        """
        doer=self
        async def implementation(json_payload):
            try:
                payload = WorkerRequest(**json_payload)
                if len(payload.data) == 1 and 'params' in payload.data:
                    # If it only contains "params", replace payload.data with its content
                    payload.data = payload.data['params']


                log_str = f"work_id:{payload.work_id}, work:{payload.path}, job_id: {payload.job_id}, profile_id: {payload.profile_id}, data: {payload.data}"

            except Exception as e:
                msg=f'Validation error - {json_payload} - {formatException(e)}'
                log.error(msg)
                await doer.nats.post("result", Message(message=msg).model_dump())
                return 

            #Run the worker
            publisher = None
            try:
                publisher = ResultPublisher(payload, self.nats, self.rest)
                publisher.result(Progress(progress=0))

                with tempfile.TemporaryDirectory() as tmpdir:
                    doer.tmpdir = tmpdir
                    worker = doer.workers[payload.path] 
                    inputs = worker.inputModel(**payload.data)
                    resolve_params(API_URL, tmpdir, inputs)
                    ret_data = worker.provider(inputs, publisher)

                    publisher.result(ret_data)
                    doer.tmpdir = None
                publisher.result(Progress(progress=100), complete=True)

            except Exception as e:
                msg=f"Executor error - {log_str} - {formatException(e)}"
                log.error(msg)
                if publisher:
                    publisher.result(Message(message=msg), complete=True)
                

        return implementation

