import asyncio
import logging
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
import multiprocessing
import sys
from ripple.automation.models import AutomationModel, AutomationsResponse
from ripple.automation.publishers import ResultPublisher
from ripple.automation.utils import format_exception
from ripple.models.params import ParameterSet
from ripple.models.streaming import Error, ProcessStreamItem
from typing import Callable, Coroutine, Literal

from ripple.config import ripple_config
from ripple.runtime.params import resolve_params


log = logging.getLogger(__name__)

def run_provider_in_async_loop(func: Callable[..., Coroutine], *args,):
    log.info("Run in parallel process")
    if asyncio.iscoroutinefunction(func):
        return asyncio.run(func(*args))
    else:
        return func(*args)

# TODO: delete this method or do not use ResultPublisher as argument passed to this 
# as it is not picklable for multiprocessing: cannot pickle \'_asyncio.Task\'
async def run_provider_in_process(func: Callable[..., Coroutine], *args,):
    if "pytest" in sys.modules:
        # Many arguments like methods are mocked with pytest - they are not picklable
        executor = ThreadPoolExecutor()
    else:
        context = multiprocessing.get_context("fork")
        executor = ProcessPoolExecutor(mp_context=context)

    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        executor,
        run_provider_in_async_loop,
        func,
        *args,
    )
    return result


class ScriptRequest(ParameterSet):
        script: str
        env: Literal['staging','production'] = 'production' 
        request_data: ParameterSet = None

def _run_script_automation() -> Callable:
    
    async def impl(request: ScriptRequest = None, responder: ResultPublisher = None) -> ProcessStreamItem:
        # Prepare the environment to hold the script's namespace
        script_namespace = {}
        if not request.request_data:
            raise ValueError("request_data is required.")

        if not responder:
            raise ValueError("responder is required.")


        # Execute the script directly in the current environment
        exec(request.script, script_namespace)

        # Prepare request model from request_data
        if "RequestModel" in script_namespace and callable(script_namespace["RequestModel"]):
            request_model = script_namespace["RequestModel"](**request.request_data.model_dump())
        else:
            raise ValueError("RequestModel not found in script.")

        api_url = ripple_config().api_base_uri
        await resolve_params(api_url, responder.directory, request_model)

        # Run the automation function
        if "runAutomation" in script_namespace and callable(script_namespace["runAutomation"]):
            result = await run_provider_in_process(script_namespace["runAutomation"], request_model, responder)
        else:
            raise ValueError("runAutomation function not found in script.")

        # Ensure ProcessStreamItem response and return it as payload
        if isinstance(result, ProcessStreamItem):
            return result
        else:
            raise ValueError("runAutomation did not return a ProcessStreamItem.")

    return impl

def _get_script_interface() -> Callable:
    async def impl(request: ScriptRequest = None, responder: ResultPublisher = None) -> ProcessStreamItem: 
        script_namespace = {}

        try:
            exec(request.script, script_namespace)

            input = None
            output = None
            # Prepare request model from request_data
            if "RequestModel" in script_namespace and callable(script_namespace["RequestModel"]):
                input = script_namespace["RequestModel"]
            else:
                raise ValueError(f"RequestModel not found in script.")
            
            if "ResponseModel" in script_namespace and callable(script_namespace["ResponseModel"]):
                output = script_namespace["ResponseModel"]
            else:
                output = ProcessStreamItem
            

            return AutomationsResponse(
                automations={
                    '/mythica/script': {
                        'input': input.model_json_schema(),
                        'output': output.model_json_schema(),
                        'hidden': True
                }
            })
        except Exception as e:
            await responder.result(Error(error=f"Script Interface Generation Error: {format_exception(e)}"))

        return(AutomationsResponse(automations={}))
    return impl

def get_default_automations() -> list[AutomationModel]:
    automations: list[AutomationModel] = []
    automations.append(AutomationModel(
        path ='/mythica/script',
        provider = _run_script_automation(),
        inputModel = ScriptRequest,
        outputModel = ProcessStreamItem,
        hidden =True
    ))
    automations.append(AutomationModel(
        path ='/mythica/script/interface',
        provider = _get_script_interface(),
        inputModel = ScriptRequest,
        outputModel = AutomationsResponse,
        hidden = True
    ))

    return automations