from datetime import datetime, timezone
import logging
import asyncio
import tempfile
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


from ripple.automation.models import AutomationModel, AutomationRequest, AutomationsResponse
from ripple.automation.publishers import ResultPublisher, SlimPublisher
from ripple.automation.utils import format_exception, error_handler
from ripple.models.streaming import Error, Progress, StreamItemUnion

from ripple.automation.adapters import NatsAdapter, RestAdapter
from ripple.automation.automations import get_default_automations

from ripple.config import ripple_config
from ripple.runtime.params import resolve_params

from typing import Callable
from ripple.models.params import ParameterSet

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

from uuid import uuid4
from opentelemetry import trace
from opentelemetry.trace.propagation.tracecontext import \
    TraceContextTextMapPropagator

from opentelemetry.trace import status as opentelemetry_status
tracer = trace.get_tracer(__name__)


process_guid = str(uuid4())





class Worker:
    def __init__(self) -> None:
        self.automations:dict[str,AutomationModel] = {}
        self.nats = NatsAdapter()
        self.rest = RestAdapter()

        catalog_provider = AutomationModel(
            path ='/mythica/automations',
            provider = self._get_catalog_provider(),
            inputModel = ParameterSet,
            outputModel = AutomationsResponse,
            hidden = True
        ) 

        autos = get_default_automations()
        autos.append(catalog_provider)
        self._load_automations(autos)


    def _get_catalog_provider(self) -> Callable[[ParameterSet, ResultPublisher], AutomationsResponse]:
        doer=self
        def impl(request: ParameterSet = None, responder: ResultPublisher=None) -> AutomationsResponse:
            ret = {}
            for path,wk in doer.automations.items():
                ret.update({
                    path: {
                        "input": wk.inputModel.model_json_schema(),
                        "output": wk.outputModel.model_json_schema(),
                        "hidden": wk.hidden                   
                    }
                })
                        
            return AutomationsResponse(automations=ret)
        return impl


    def start(self, subject: str, automations: list[AutomationModel]) -> None:
        self._load_automations(automations)

        loop = asyncio.get_event_loop()        
        task = loop.create_task(self.nats.listen(subject, self._get_executor()))
        task.add_done_callback(error_handler(log))

        # Run loop until canceled or an exception escapes
        loop.run_forever()


    def start_web(self, automations: list[AutomationModel]) -> FastAPI:
        self._load_automations(automations)
        return self._get_web_executor()


    def _load_automations(self,automations: list[AutomationModel]):
        """Function to dynamically discover and register workers in a container"""
        try:
            log.debug(f'Start Registering automations')
            for automation in automations:
                if type(automation) is not AutomationModel:
                    automation = AutomationModel(**automation)
                self.automations[automation.path] = automation
                log.debug(f"Registered automations for '{automation.path}'")
            log.debug(f'End Registering automations')
        except Exception as e:
            log.error(f'Failed to register automations: {format_exception(e)}')

    def _get_executor(self):
        """
        Execute an automation by trying to find a route that maps
        to the path defined in the payload. If a route is defined,
        data is sent to the route provider, along with a callback for 
        reporting status
        """
        doer=self
        async def implementation(json_payload: dict):
            headers: dict = json_payload.get("telemetry_context", {})
            # Init telemetry_context before root trace
            telemetry_context = TraceContextTextMapPropagator().extract(carrier=headers)
            log.info('auto/ telemetry_context: %s', telemetry_context)
            with tracer.start_as_current_span("worker.execution", context=telemetry_context) as span:
                ret_data = None
                span.set_attribute("worker.started", datetime.now(timezone.utc).isoformat())
                try:
                    auto_request = AutomationRequest(**json_payload)

                    trace_data = {"correlation": auto_request.correlation,
                                  "job_id": auto_request.job_id if auto_request.job_id else "" }
                    span.set_attributes(trace_data)
                    if len(auto_request.data) == 1 and 'params' in auto_request.data:
                        # If it only contains "params", replace payload.data with its content
                        auto_request.data = auto_request.data['params']

                    log_str = f"correlation: {auto_request.correlation}, work:{auto_request.path}, job_id: {auto_request.job_id}, data: {auto_request.data}"

                except Exception as e:
                    msg=f'Validation error - {json_payload} - {format_exception(e)}'
                    log.error(msg)
                    span.set_status(opentelemetry_status.Status(opentelemetry_status.StatusCode.ERROR, msg))
                    await doer.nats.post("result", Error(error=msg).model_dump())
                    return 

                #Run the worker
                publisher = None
                try:
                    with tempfile.TemporaryDirectory() as tmpdir:
                        publisher = ResultPublisher(auto_request, self.nats, self.rest, tmpdir)
                        publisher.result(Progress(progress=0))

                        worker = doer.automations[auto_request.path]
                        inputs = worker.inputModel(**auto_request.data)
                        api_url = ripple_config().api_base_uri
                        resolve_params(api_url, tmpdir, inputs, headers=auto_request.telemetry_context)
                        with tracer.start_as_current_span("job.execution", context=telemetry_context) as job_span:
                            job_span.set_attribute("job.started", datetime.now(timezone.utc).isoformat())
                            ret_data: StreamItemUnion = worker.provider(inputs, publisher)
                            job_span.set_attribute("job.completed", datetime.now(timezone.utc).isoformat())

                        publisher.result(ret_data)
                    publisher.result(Progress(progress=100), complete=True)
                    telemetry_status = opentelemetry_status.Status(opentelemetry_status.StatusCode.OK)
                except Exception as e:
                    msg=f"Executor error - {log_str} - {format_exception(e)}"
                    if publisher:
                        publisher.result(Error(error=msg), complete=True)
                    telemetry_status = opentelemetry_status.Status(opentelemetry_status.StatusCode.ERROR, msg)
                    log.error(msg)
                    span.record_exception(e)
                finally:
                    span.set_attribute("worker.completed", datetime.now(timezone.utc).isoformat())
                    if ret_data and ret_data.job_id:
                        span.set_attribute("job_id", ret_data.job_id)
                    span.set_status(telemetry_status)
                    log.info("Job finished %s", auto_request.correlation)

        return implementation

    def _get_web_executor(self):
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
            Handles automation requests and dispatches to appropriate automation function.
            """
            # Set CORS headers
            headers = {"Access-Control-Allow-Origin": "*"}

            # Parse request data
            request_data = await request.json()
            request_data['process_guid'] = process_guid
            auto_request = AutomationRequest(**request_data)
            
            
            # Find the appropriate worker by path
            automation = self.automations[auto_request.path]

            if not automation:
                return JSONResponse(
                    content={"correlation": auto_request.correlation, "result": {"error": f"No automation found for path '{auto_request.path}'"}},
                    status_code=404,
                    headers=headers,
                )

            # Convert request data to the input model
            input_model_class = automation.inputModel
            try:
                input_data = input_model_class(**auto_request.data)  # Validate and parse the input
            except Exception as e:
                log.error(f"Automation failed: {format_exception(e)}")
                return JSONResponse(
                    content={"correlation": auto_request.correlation, "result": {"error": f"Invalid input data: {format_exception(e)}"}},
                    status_code=422,
                    headers=headers,
                )
      

            # Execute the worker's provider function
            try:

                with tempfile.TemporaryDirectory() as tmpdir:
                    api_url = ripple_config().api_base_uri
                    resolve_params(api_url, tmpdir, input_data)
                    publisher = SlimPublisher(request=auto_request, rest=self.rest, directory=tmpdir)
                    result = automation.provider(input_data, publisher)
                    publisher.result(result)
                    
            except Exception as e:
                log.error(f"Automation failed: {format_exception(e)}")
                return JSONResponse(
                    content={"correlation": auto_request.correlation, "result": {"error": f"Automation failed: {format_exception(e)}"}},
                    status_code=500,
                    headers=headers,
                )

            # Return result
            return JSONResponse(
                content={"correlation": auto_request.correlation, "result": result.model_dump()},
                status_code=200,
                headers=headers,
            )
        return app        
        
