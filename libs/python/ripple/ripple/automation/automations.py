from ripple.automation.publishers import ResultPublisher
from ripple.automation.utils import AutomationsResponse, format_exception, AutomationModel
from ripple.models.params import ParameterSet
from ripple.models.streaming import Message, ProcessStreamItem
from typing import Any, Callable, Dict, Literal, Type

from ripple.config import ripple_config
from ripple.runtime.params import resolve_params



class ScriptRequest(ParameterSet):
        script: str
        env: Literal['staging','production'] = 'production' 
        request_data: ParameterSet = None

def _run_script_automation() -> Callable:
    
    def impl(request: ScriptRequest = None, responder: ResultPublisher = None) -> ProcessStreamItem:
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
        resolve_params(api_url, responder.directory, request_model)

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

def _get_script_interface() -> Callable:
    def impl(request: ScriptRequest = None, responder: ResultPublisher = None) -> ProcessStreamItem: 
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
            responder.result(Message(message=f"Script Interface Generation Error: {format_exception(e)}"))

        return(AutomationsResponse(automations={}))
    return impl
    
def get_script_automations() -> list[AutomationModel]:
    automations: list[AutomationModel] = []
    automations.append({
        'path':'/mythica/script',
        'provider': _run_script_automation(),
        'inputModel': ScriptRequest,
        'outputModel': ProcessStreamItem
    })
    automations.append({
        'path':'/mythica/script/interface',
        'provider': _get_script_interface(),
        'inputModel': ScriptRequest,
        'outputModel': AutomationsResponse,
        'hidden': True
    })

    return automations