import json

from ripple.automation.models import AutomationModel, AutomationsResponse
from ripple.automation.publishers import ResultPublisher
from ripple.automation.utils import format_exception
from ripple.models.params import FileParameter, HoudiniParmTemplateSpecType, ParameterSet, ParameterSpec
from ripple.models.assets import AssetVersionEntryPointReference
from ripple.models.streaming import Error, JobDefinition, ProcessStreamItem
from typing import Callable, Literal, Optional, Tuple, Any, Dict
from functools import wraps

from ripple.config import ripple_config
from ripple.runtime.params import resolve_params

class ScriptRequest(ParameterSet):
    script: str = None
    env: Literal['staging','production'] = 'production' 
    request_data: ParameterSet = None

def script_request_model():
    """Decorator to associate a class to a request model."""
    def decorator(cls):
        if not issubclass(cls, ParameterSet):
            raise TypeError("@script_request_model can only be used with subclasses of ParameterSet")
        cls._is_script_request_model = True
        return cls
    return decorator

def script_response_model():
    """Decorator to associate a class to a response model."""
    def decorator(cls):
        if not issubclass(cls, ProcessStreamItem):
            raise TypeError("@script_response_model can only be used with subclasses of ProcessStreamItem")
        cls._is_script_response_model = True
        return cls
    return decorator

def script_interface():
    """Decorator to associate a value as the interface.
    The value should be of type list[HoudiniParmTemplateSpecType]"""
    def decorator(cls):
        if not isinstance(cls, list[HoudiniParmTemplateSpecType]):
            raise TypeError("@script_interface can only be used with a list of HoudiniParmTemplateSpecType")
        cls._is_script_interface = True
        return cls
    return decorator


def script_operation():
    """Decorator to associate a method to an operation."""
    def decorator(func):
        if not callable(func):
            raise TypeError("@script_operation can only be used with callable methods")

        @wraps(func)
        def wrapper(*args, **kwargs):
            # Validate the method signature
            if len(args) < 1 or not isinstance(args[0], ParameterSet):
                raise TypeError("The first argument of the operation must be a subclass of ParameterSet")

            if 'responder' in kwargs and kwargs['responder'] is not None and not isinstance(kwargs['responder'], ResultPublisher):
                raise TypeError("The 'responder' argument must be of type ResultPublisher")

            result = func(*args, **kwargs)

            if not isinstance(result, ProcessStreamItem):
                raise TypeError("The return value of the operation must be a subclass of ProcessStreamItem")

            return result
        
        wrapper._is_script_operation = True
        return wrapper

    return decorator

def _find_decorated_models(script_namespace: Dict[str, Any]) -> Tuple[Optional[ParameterSet], Optional[ProcessStreamItem]]:
    """Find request and response models that have been decorated with the appropriate decorators."""
    request_model = None
    response_model = None
    
    for name, obj in script_namespace.items():
        if hasattr(obj, "_is_script_request_model") and obj._is_script_request_model:
            request_model = obj
        if hasattr(obj, "_is_script_response_model") and obj._is_script_response_model:
            response_model = obj
       
    return request_model, response_model

def _find_operation(script_namespace: Dict[str, Any]) -> Optional[Callable]:
    """Find the operation function that has been decorated with @script_operation."""
    for name, obj in script_namespace.items():
        if hasattr(obj, "_is_script_operation") and obj._is_script_operation:
            return obj
    
    return None

def _find_script_interface(script_namespace: Dict[str, Any]) -> Optional[list[HoudiniParmTemplateSpecType]]:
    """Find the script interface that has been decorated with @script_interface."""
    for name, obj in script_namespace.items():
        if hasattr(obj, "_is_script_interface") and obj._is_script_interface:
            return obj
    
    return None

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

        # Find request model and create an instance
        request_model_class, _ = _find_decorated_models(script_namespace)
        if request_model_class is None:
            raise ValueError("No request model found. Use @script_request_model decorator.")
        
        request_model = request_model_class(**request.request_data.model_dump())

        api_url = ripple_config().api_base_uri
        resolve_params(api_url, responder.directory, request_model)

        # Find and run the operation function
        operation = _find_operation(script_namespace)
        if operation is None:
            raise ValueError("No operation function found. Use @script_operation decorator.")
        
        result = operation(request_model, responder)

        # Ensure ProcessStreamItem response and return it as payload
        if isinstance(result, ProcessStreamItem):
            return result
        else:
            raise ValueError("Operation did not return a ProcessStreamItem.")

    return impl

def _get_script_interface() -> Callable:
    def impl(request: ScriptRequest = None, responder: ResultPublisher = None) -> ProcessStreamItem: 
        script_namespace = {}

        try:
            exec(request.script, script_namespace)

            # Find request and response models using decorators
            input_model, output_model = _find_decorated_models(script_namespace)
            if input_model is None:
                raise ValueError("No request model found. Use @script_request_model decorator.")
            
            if output_model is None:
                output_model = ProcessStreamItem
            
            # Find operation function
            operation = _find_operation(script_namespace)
            if operation is None:
                raise ValueError("No operation function found. Use @script_operation decorator.")
            
            return AutomationsResponse(
                automations={
                    '/mythica/script': {
                        'input': input_model.model_json_schema(),
                        'output': output_model.model_json_schema(),
                        'hidden': True
                    }
                }
            )
        except Exception as e:
            responder.result(Error(error=f"Script Interface Generation Error: {format_exception(e)}"))

        return(AutomationsResponse(automations={}))
    return impl

class ScriptJobDefRequest(ParameterSet):
    awpy_file: FileParameter
    src_asset_id: str
    src_version: list[int]

class ScriptJobDefResponse(ProcessStreamItem):
    item_type: Literal["script_job_def"] = "script_job_def"
    job_definition: JobDefinition


def _get_script_job_def() -> Callable:
    def impl(request: ScriptJobDefRequest = None, responder: ResultPublisher = None) -> ScriptJobDefResponse: 
        script_namespace = {}
        awpy_file = request.awpy_file
        with open(awpy_file.get("file_path"), 'r') as f:
            awpy = json.load(f)

        if len(request.src_asset_id) > 0:
            source = AssetVersionEntryPointReference(
                asset_id=request.src_asset_id,
                major=request.src_version[0],
                minor=request.src_version[1],
                patch=request.src_version[2],
                file_id=awpy_file.get("file_id"),
                entry_point=awpy.get('name')
            )
        try:
            if not awpy.get("worker"):
                raise ValueError("Worker is required.")

            exec(awpy.get("script"), script_namespace)
            
            # Find request and response models using decorators
            input_model, output_model = _find_decorated_models(script_namespace)
            if input_model is None:
                raise ValueError("No request model found. Use @script_request_model decorator.")
            
            if output_model is None:
                output_model = ProcessStreamItem
            
            # Find operation function
            operation = _find_operation(script_namespace)
            if operation is None:
                raise ValueError("No operation function found. Use @script_operation decorator.")

            params = ParameterSpec(params={})

            # read a script Interface model if one exists:
            interface_model = _find_script_interface(script_namespace)
            if interface_model:
                params.params_v2=interface_model
            else:
                # If no interface model is found, use the default parameter spec
                params.params_v2 = input_model.get_parameter_specs()

            params.default = {
                "script": awpy.get("script")
            }


            jd = JobDefinition(
                job_type = f'{request.worker}::/mythica/script',
                name = awpy.get('name'),
                description = awpy.get('description', ''),
                parameter_spec = params,
                owner_id = None,
                source = source
            )
            responder.result(jd)
            return ScriptJobDefResponse(job_definition=jd)
        
        except Exception as e:
            responder.result(Error(error=f"Script Interface Generation Error: {format_exception(e)}"))

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
    automations.append(AutomationModel(
        path ='/mythica/script/job_def',
        provider = _get_script_job_def(),
        inputModel = ScriptRequest,
        outputModel = ScriptJobDefResponse,
        hidden = True
    ))

    return automations