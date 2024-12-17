from datetime import datetime, timezone
import json
import os
import logging
import traceback
import asyncio
import uuid
import nats
import requests
import tempfile
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


from pydantic import BaseModel, model_validator
from typing import Callable, Type, Optional, Dict, Any, Literal

import cryptid.location

from ripple.auth.generate_token import decode_token
from ripple.config import ripple_config
from ripple.models.params import ParameterSet
from ripple.models.streaming import ProcessStreamItem, OutputFiles, Progress, Message, JobDefinition
from ripple.runtime.params import resolve_params
from uuid import uuid4
from opentelemetry import trace
from opentelemetry.trace.propagation.tracecontext import \
    TraceContextTextMapPropagator

from opentelemetry.trace import status as opentelemetry_status
from ripple.models.streaming import StreamItemUnion

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)


tracer = trace.get_tracer(__name__)

process_guid = str(uuid4())

def format_exception(e):
    return f" {str(e)}\n{traceback.format_exc()}"

NATS_URL= os.environ.get('NATS_ENDPOINT', 'nats://localhost:4222')


class NatsAdapter():
    def __init__(self, nats_url=NATS_URL) -> None:
        self.nats_url = nats_url
        self.listeners = {}
        self.nc = None  # Single NATS client connection
        self.env = os.getenv('MYTHICA_ENVIRONMENT', 'debug')
        self.location = cryptid.location.location()

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

    def _scoped_subject(self, subject: str) -> str:
        """Return a subject that is scoped to the environment and location"""
        return f"{subject}.{self.env}.{self.location}"

    def _scoped_subject_to(self, subject: str, entity: str) -> str:
        """Return a subject that is scoped to a scoped entity"""
        return f"{subject}.{self.env}.{self.location}.{entity}"

    async def _internal_post(self, subject: str, data: dict) -> None:
        await self._connect()
        try:
            await self.nc.publish(subject, json.dumps(data).encode())
            log.info(f"Posted: {subject} - {data}")
        except Exception as e:
            log.error(f"Sending to NATS failed: {subject} - {data} - {format_exception(e)}")
        finally:
            if not self.listeners:
                await self._disconnect()

    async def post(self, subject: str, data: dict) -> None:
        """Post data to NATS on subject. """
        await self._internal_post(self._scoped_subject(subject), data)

    async def post_to(self, subject: str, entity: str, data: dict) -> None:
        await self._internal_post(self._scoped_subject_to(subject, entity), data)

    async def listen(self, subject: str, callback: callable):
        await self._internal_listen(self._scoped_subject(subject), callback)

    async def listen_as(self, subject: str, entity: str, callback: callable):
        await self._internal_listen(self._scoped_subject_to(subject, entity), callback)

    async def _internal_listen(self, subject: str, callback: callable):
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
                log.error(f"Error processing message on {subject}: {format_exception(e)}")

        try:
            # Wait for the response with a timeout (customize as necessary)
            log.debug("Setting up NATS response listener")
            listener = await self.nc.subscribe(subject, queue="worker", cb=message_handler)
            self.listeners[subject] = listener
            log.info(f"NATS subscribed to {subject}")

        except Exception as e:
            log.error(f"Error setting up listener for subject {subject}: {format_exception(e)}")
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
    
    def get(self, endpoint: str, data: dict={}, token: str = None) -> Optional[str]:
        """Get data from an endpoint."""
        log.debug(f"Getting from Endpoint: {endpoint} - {data}" )
        response = requests.get(
            endpoint,
            headers={
                "Authorization": "Bearer %s" % token
            }
        )
        if response.status_code in [200,201]:
            log.debug(f"Endpoint Response: {response.status_code}")
            return response.json()
        else:
            log.error(f"Failed to call job API: {endpoint} - {data} - {response.status_code}")
            return None

    def post(self, endpoint: str, json_data: Any, token: str) -> Optional[str]:
        """Post data to an endpoint synchronously. """
        log.debug(f"posting[{endpoint}]: {json_data}" )
        response = requests.post(
            endpoint, 
            json=json_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer %s" % token
            }
        )
        if response.status_code in [200,201]:
            log.debug(f"Endpoint Response: {response.status_code}")
            return response.json()
        else:
            log.error(f"Failed to call job API: {endpoint} - {json_data} - {response.status_code}")
            return None

    def post_file(self, endpoint: str, file_data: list, token: str) -> Optional[str]:
        """Post file to an endpoint."""
        log.debug(f"Sending file to Endpoint: {endpoint} - {file_data}" )
        response = requests.post(
            endpoint, 
            files=file_data, 
            headers={"Authorization": "Bearer %s" % token}
        )
        if response.status_code in [200,201]:
            log.debug(f"Endpoint Response: {response.status_code}")
            return response.json()
        else:
            log.error(f"Failed to call job API: {endpoint} - {file_data} - {response.status_code}")
            return None

class WorkerModel(BaseModel):
    path: str
    provider: Callable
    inputModel: Type[ParameterSet]
    outputModel: Type[ProcessStreamItem]
    hidden: bool = False


class WorkerRequest(BaseModel):
    """
    Contract for requests for work, results will be published back to
    result subject of the process guid.
    """
    process_guid: str
    work_guid: str
    job_id: Optional[str] = None
    auth_token: Optional[str] = None
    path: str
    data: Dict


class ResultPublisher:
    """"
    Object that encapsulates streaming results back for a work request
    """
    request: WorkerRequest
    nats: NatsAdapter
    rest: RestAdapter
    
    def __init__(self, request: WorkerRequest, nats_adapter: NatsAdapter, rest: RestAdapter) -> None:
        self.request = request
        self.profile = decode_token(request.auth_token)
        self.nats = nats_adapter
        self.rest = rest
        self.api_url = ripple_config().api_base_uri
        
    #Callback for reporting back. 
    def result(self, item: ProcessStreamItem, complete: bool=False):
        item.process_guid = process_guid
        item.correlation = self.request.work_guid
        item.job_id = self.request.job_id or ""

        # Upload any references to local data
        self._publish_local_data(item, self.api_url)

        job_result_endpoint=f"{self.api_url}/jobs/results"
        job_complete_endpoint=f"{self.api_url}/jobs/complete"

        # Publish results
        log.info(f"Job {'Result' if not complete else 'Complete'} -> {item}")

        task = asyncio.create_task(
            self.nats.post_to(
                "result",
                self.request.process_guid,
                item.model_dump()))
        
        task.add_done_callback(_get_error_handler())
        if self.request.job_id:
            if complete:
                self.rest.post(
                    f"{job_complete_endpoint}/{self.request.job_id}",
                    json_data={},
                    token=self.request.auth_token)
            else:
                data = {
                    "created_in": "automation-worker",
                    "result_data": item.model_dump()
                }
                self.rest.post(
                    f"{job_result_endpoint}/{self.request.job_id}",
                    json_data=data,
                    token=self.request.auth_token)

    def _publish_local_data(self, item: ProcessStreamItem, api_url: str) -> None:


        def upload_file(file_path: str) -> Optional[str]:
            if not os.path.exists(file_path):
                return None

            try:
                with open(file_path, 'rb') as file:
                    file_name = os.path.basename(file_path)
                    file_data = [('files', (file_name, file, 'application/octet-stream'))]
                    response = self.rest.post_file(f"{api_url}/upload/store",  file_data, self.request.auth_token)
                    file_id = response['files'][0]['file_id'] if response else None
                    return file_id
            finally:
                os.remove(file_path)

        def upload_job_def(job_def: JobDefinition) -> Optional[str]:
            definition = {
                'job_type': job_def.job_type,
                'name': job_def.name,
                'description': job_def.description,
                'params_schema': job_def.parameter_spec.model_dump()
            }
            response = self.rest.post(f"{api_url}/jobs/definitions", definition, self.request.auth_token)
            return response['job_def_id'] if response else None

        #TODO: Report errors
        if isinstance(item, OutputFiles):
            for key, files in item.files.items():
                for index, file in enumerate(files):
                    file_id = upload_file(file)
                    files[index] = file_id

        elif isinstance(item, JobDefinition):
            job_def_id = upload_job_def(item)
            if job_def_id is not None:
                item.job_def_id = job_def_id


def _get_error_handler():
    def handler(task):
        e = task.exception()
        if e:
            log.error(f"Error publishing result: {format_exception(e)}")
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
        env: Literal['staging','production'] = 'production' 
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

            api_url = ripple_config().api_base_uri
            resolve_params(api_url, doer.tmpdir, request_model)

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
                responder.result(Message(message=f"Script Interface Generation Error: {format_exception(e)}"))

            return(Worker.CatalogResponse(workers={}))
        return impl
    
    def _inject_local_workers(self, workers: list[dict]) -> None:
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

    def start(self, subject: str, workers: list[dict]) -> None:
        self._inject_local_workers(workers)

        loop = asyncio.get_event_loop()        
        task = loop.create_task(self.nats.listen(subject, self._get_executor()))
        task.add_done_callback(_get_error_handler())

        # Run loop until canceled or an exception escapes
        loop.run_forever()


    def start_web(self, workers: list[dict]):
        self._inject_local_workers(workers)
        """
        Start a FastAPI app dynamically based on the workers list.
        """
        app = FastAPI(title=f"Automation API", description="Mythica Automation API")

        @app.options("/")
        async def preflight():
            """
            Handles CORS preflight requests.
            """
            headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "3600",
            }
            return JSONResponse(content=None, status_code=204, headers=headers)
        
        @app.post("/")
        async def automation_request(request: Request):
            """
            Handles automation requests and dispatches to appropriate worker functions.
            """
            # Set CORS headers
            headers = {"Access-Control-Allow-Origin": "*"}

            # Parse request data
            request_data = await request.json()
            request_data['process_guid'] = process_guid
            wreq = WorkerRequest(**request_data)
            
            
            # Find the appropriate worker by path
            worker = self.workers[wreq.path]

            if not worker:
                return JSONResponse(
                    content={"work_guid": wreq.work_guid, "result": {"error": f"No worker found for path '{wreq.path}'"}},
                    status_code=404,
                    headers=headers,
                )

            # Convert request data to the input model
            input_model_class = worker.inputModel
            try:
                input_data = input_model_class(**wreq.data)  # Validate and parse the input
            except Exception as e:
                log.error(f"Worker execution failed: {format_exception(e)}")
                return JSONResponse(
                    content={"work_guid": wreq.work_guid, "result": {"error": f"Invalid input data: {format_exception(e)}"}},
                    status_code=422,
                    headers=headers,
                )
            class SlimPublisher(ResultPublisher):
                
                def __init__(myself) -> None:
                    myself.rest = self.rest
                    myself.request = wreq
                def result(myself, item: ProcessStreamItem, complete: bool=False):
                    item.process_guid = process_guid
                    item.correlation = myself.request.work_guid
                    item.job_id = ""

                    # Upload any references to local data
                    myself._publish_local_data(item, ripple_config().api_base_uri)            

            # Execute the worker's provider function
            try:

                with tempfile.TemporaryDirectory() as tmpdir:
                    self.tmpdir = tmpdir
                    api_url = ripple_config().api_base_uri
                    resolve_params(api_url, tmpdir, input_data)
                    publisher = SlimPublisher()
                    result = worker.provider(input_data, publisher)
                    publisher.result(result)
                    self.tmpdir = None
                    
            except Exception as e:
                log.error(f"Worker execution failed: {format_exception(e)}")
                return JSONResponse(
                    content={"work_guid": wreq.work_guid, "result": {"error": f"Worker execution failed: {format_exception(e)}"}},
                    status_code=500,
                    headers=headers,
                )

            # Return result
            return JSONResponse(
                content={"work_guid": wreq.work_guid, "result": result.dict()},
                status_code=200,
                headers=headers,
            )
        return app

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
            log.error(f'Failed to register workers: {format_exception(e)}')

    def _get_executor(self):
        """
        Execute a work unit by trying to find a route that maps
        to the path defined in the payload. If a route is defined,
        data is sent to the route provider, along with a callback for 
        reporting status
        """
        doer=self
        async def implementation(json_payload):
            with tracer.start_as_current_span("worker.execution") as span:
                ret_data = None
                span.set_attribute("worker.started", datetime.now(timezone.utc).isoformat())
                try:
                    work_request = WorkerRequest(**json_payload)
                    trace_data = {"work_guid": work_request.work_guid,
                                  "job_id": work_request.job_id if work_request.job_id else "" }
                    span.set_attributes(trace_data)
                    if len(work_request.data) == 1 and 'params' in work_request.data:
                        # If it only contains "params", replace payload.data with its content
                        work_request.data = work_request.data['params']

                    log_str = f"work_guid: {work_request.work_guid}, work:{work_request.path}, job_id: {work_request.job_id}, data: {work_request.data}"

                except Exception as e:
                    msg=f'Validation error - {json_payload} - {format_exception(e)}'
                    log.error(msg)
                    span.set_status(opentelemetry_status.Status(opentelemetry_status.StatusCode.ERROR, msg))
                    await doer.nats.post("result", Message(message=msg).model_dump())
                    return 

                #Run the worker
                publisher = None
                try:
                    carrier = {}
                    TraceContextTextMapPropagator().inject(carrier)
                    publisher = ResultPublisher(work_request, self.nats, self.rest)
                    publisher.result(Progress(progress=0))

                    with tempfile.TemporaryDirectory() as tmpdir:
                        doer.tmpdir = tmpdir
                        worker = doer.workers[work_request.path]
                        inputs = worker.inputModel(**work_request.data)
                        api_url = ripple_config().api_base_uri
                        resolve_params(api_url, tmpdir, inputs)
                        with tracer.start_as_current_span("job.execution") as job_span:
                            job_span.set_attribute("job.started", datetime.now(timezone.utc).isoformat())
                            ret_data: StreamItemUnion = worker.provider(inputs, publisher)
                            job_span.set_attribute("job.completed", datetime.now(timezone.utc).isoformat())

                        publisher.result(ret_data)
                        doer.tmpdir = None
                    publisher.result(Progress(progress=100), complete=True)
                    telemetry_status = opentelemetry_status.Status(opentelemetry_status.StatusCode.OK)
                except Exception as e:
                    msg=f"Executor error - {log_str} - {format_exception(e)}"
                    telemetry_status = opentelemetry_status.Status(opentelemetry_status.StatusCode.ERROR, msg)
                    log.error(msg)
                    span.record_exception(e)
                    if publisher:
                        publisher.result(Message(message=msg), complete=True)
                finally:
                    span.set_attribute("worker.completed", datetime.now(timezone.utc).isoformat())
                    if ret_data and ret_data.job_id:
                        span.set_attribute("job_id", ret_data.job_id)
                    span.set_status(telemetry_status)
                    log.info("Job finished %s", work_request.work_guid)

        return implementation

