import json
import os
import aiohttp
import logging
import asyncio
import nats
import requests
import tempfile
from pydantic import BaseModel
from typing import Callable, Type, Optional, Dict
from ripple.models.params import ParameterSet
from ripple.models.streaming import ProcessStreamItem, OutputFiles, Progress, Message, JobDefinition
from ripple.runtime.params import resolve_params

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

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
            log.debug("Connected to NATS")


    async def _disconnect(self):
        """Disconnect from NATS gracefully."""
        if self.nc:
            log.debug("Disconnecting from NATS")
            await self.nc.drain()  # Gracefully stop receiving messages
            self.nc = None
            log.debug("Disconnected from NATS")

    async def post(self, subject: str, data: dict) -> None:
        """Post data to NATS on subject. """
        await self._connect()                
        try:
            log.debug(f"Sending to NATS: {subject} - {data}" )
            await(self.nc.publish(subject, json.dumps(data).encode()))
            log.debug(f"Sent to NATS")
        except Exception as e:
            log.error(f"Sending to NATS failed: {subject} - {data} - {e}")
        finally:
            if not self.listeners:
                await self._disconnect()


    async def listen(self, subject: str, callback: callable):
        """ Listen to NATS """
        await self._connect()

        if subject in self.listeners:
            log.warning(f"NATS listener already active for subject {subject}")
            return

        async def message_handler(msg):
            try:
                payload = json.loads(msg.data.decode('utf-8'))
                log.info(f"Received message on {subject}: {payload}")
                await callback(payload)
            except Exception as e:
                log.error(f"Error processing message on {subject}: {e}")

        try:
        
            # Wait for the response with a timeout (customize as necessary)
            log.info("Setting up NATS response listener")
            listener = await self.nc.subscribe(subject, cb=message_handler)
            self.listeners[subject] = listener
            log.info("NATS response listener set up")

        except Exception as e:
            log.error(f"Error setting up listener for subject {subject}: {e}")
            raise e

    async def unlisten(self, subject: str):

        """Shut down the listener for a specific subject."""
        if subject in self.listeners:
            log.info(f"Shutting down listener for subject {subject}")
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

    async def post(self, endpoint: str, data: str) -> None:
        """Post data to an endpoint. """
        url = API_URL + endpoint
        async with aiohttp.ClientSession() as session:
            log.debug(f"Sending to Endpoint: {url} - {data}" )
            async with session.post(
                        url, 
                        json=data, 
                        headers={"Content-Type": "application/json"}) as post_result:
                if post_result.status in [200,201]:
                    log.debug(f"Endpoint Response: {post_result.status}")
                else:
                    log.error(f"Failed to call job API: {url} - {data} - {post_result.status}")

    def post_sync(self, endpoint: str, data: str) -> Optional[str]:
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


def start_session(rest: RestAdapter, profile_id: str) -> Optional[str]:
    url = f"/sessions/direct/{profile_id}"
    response = rest.get(url)
    return response['token'] if response else None


def upload_file(rest: RestAdapter, token: str, file_path: str) -> Optional[str]:
    file_id = None
    with open(file_path, 'rb') as file:
        file_name = os.path.basename(file_path)
        file_data = [('files', (file_name, file, 'application/octet-stream'))]
        response = rest.post_file("/upload/store", token, file_data)
        file_id = response['files'][0]['file_id'] if response else None
    return file_id


def upload_job_def(rest: RestAdapter, job_def: JobDefinition) -> Optional[str]:
    definition = {
        'job_type': job_def.job_type,
        'name': job_def.name,
        'description': job_def.description,
        'params_schema': job_def.parameter_spec.dict()
    }
    response = rest.post_sync("/jobs/definitions", definition)
    return response['job_def_id'] if response else None


class WorkerModel(BaseModel):
    path: str
    provider: Callable
    inputModel: Type[BaseModel]

class WorkerRequest(BaseModel):
    """Contract for requests for work"""
    work_id: str
    job_id: Optional[str] = None
    profile_id: Optional[str] = None
    path: str
    data: Dict

class WorkerResponse(WorkerRequest):
    """Contract for responses to work requess"""
    result_data: Dict   


class Worker:
    def __init__(self) -> None:
        self.workers:dict[str,WorkerModel] = {}
        self.nats = NatsAdapter()
        self.rest = RestAdapter()
        
        
    def start(self,subject: str, workers:list[dict]) -> None:
        self._load_workers(workers)

        loop = asyncio.get_event_loop()        
        task = loop.create_task(self.nats.listen(subject, self._get_executor()))
        task.add_done_callback(self._get_error_handler())

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
            log.error(f'Failed to register workers: {e}')

    def _publish_local_data(self, item: ProcessStreamItem):
        #TODO: Report errors
        if isinstance(item, OutputFiles):
            token = start_session(self.rest, self.current_request.profile_id)

            for key, files in item.files.items():
                for index, file in enumerate(files):
                    file_id = upload_file(self.rest, token, file)
                    files[index] = file_id
        elif isinstance(item, JobDefinition):
            job_def_id = upload_job_def(self.rest, item)
            if job_def_id != None:
                item.job_def_id = job_def_id


    #Callback for reporting back. 
    def _result(self, item: ProcessStreamItem, complete=False):
        JOB_RESULT_ENDPOINT="/jobs/results"
        JOB_COMPLETE_ENDPOINT="/jobs/complete"

        # Poplulate context
        #TODO: Generate process guid
        item.process_guid = 'xxxxxxxxxxx'
        item.job_id = self.current_request.job_id if self.current_request.job_id is not None else ""

        # Upload any references to local data
        self._publish_local_data(item)

        # Publish results
        log.info(f"Job {'Result' if not complete else 'Complete'} -> {item}")

        task = asyncio.create_task(self.nats.post("result", item.json())) 
        task.add_done_callback(self._get_error_handler())
        if self.current_request.job_id:
            if complete:
                task = asyncio.create_task(self.rest.post(f"{JOB_COMPLETE_ENDPOINT}/{item.job_id}", ""))
            else:
                task = asyncio.create_task(self.rest.post(f"{JOB_RESULT_ENDPOINT}/{item.job_id}", item.json()))
            task.add_done_callback(self._get_error_handler())
            
    def _get_error_handler(self):
        def handler(task):
            e = task.exception()
            if e:
                log.error(f"Error publishing result: {e}")
        return handler
    
    def _get_executor(self):
        """
        Execute a work unit by trying to find a route that maps
        to the path defined in the payload. If a route is defined,
        data is sent to the route provider, along with a callback for 
        reporting status
        """
        doer=self
        async def implementation(json_payload: str):
            try:
                payload = WorkerRequest(**json_payload)

                log_str = f"work_id:{payload.work_id}, work:{payload.path}, job_id: {payload.job_id}, profile_id: {payload.profile_id}, data: {payload.data}"

                #TODO: These should be defined elsewhere.

            except Exception as e:
                msg=f'Error parsing payload - {json_payload} - {str(e)}'
                await doer.nats.post("result", {'status': msg })
                #Cannot report to endpoint as message could not be parsed
                log.error(f"Validation error: {msg}")
                return 

            #Run the worker
            try:
                doer.current_request = payload

                doer._result(Progress(progress=0))

                with tempfile.TemporaryDirectory() as tmpdir:
                    worker = doer.workers[payload.path] 
                    inputs = worker.inputModel(**payload.data)
                    if isinstance(inputs, ParameterSet):
                        resolve_params(API_URL, tmpdir, inputs)
                    worker.provider(inputs, doer._result)

                doer._result(Progress(progress=100), complete=True)

            except Exception as e:
                log.error(f"Executor error - {log_str} - {e}")
                doer._result(Message(message=str(e)))
                

        return implementation

