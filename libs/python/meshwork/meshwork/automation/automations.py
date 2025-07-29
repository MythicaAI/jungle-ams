import json
from collections.abc import Callable
from functools import wraps
from typing import Any, Literal

from meshwork.automation.models import AutomationModel, AutomationsResponse
from meshwork.automation.publishers import ResultPublisher
from meshwork.automation.utils import format_exception
from meshwork.config import meshwork_config
from meshwork.models.assets import AssetVersionEntryPointReference
from meshwork.models.params import (
    FileParameter,
    HoudiniParmTemplateSpecType,
    ParameterSet,
    ParameterSpec,
)
from meshwork.models.streaming import Error, JobDefinition, ProcessStreamItem
from meshwork.runtime.params import resolve_params


class ScriptRequest(ParameterSet):
    script: str = None
    request_data: ParameterSet = None


def automation_request():
    """Decorator to associate a class to a request model."""

    def decorator(cls):
        if not isinstance(cls, type):
            raise TypeError("@automation_request can only be used with classes")
        if not issubclass(cls, ParameterSet):
            raise TypeError(
                "@automation_request can only be used with subclasses of ParameterSet"
            )
        cls._is_automation_request = True
        return cls

    return decorator


def automation_response():
    """Decorator to associate a class to a response model."""

    def decorator(cls):
        if not isinstance(cls, type):
            raise TypeError("@automation_response can only be used with classes")
        if not issubclass(cls, ProcessStreamItem):
            raise TypeError(
                "@automation_response can only be used with subclasses of ProcessStreamItem"
            )
        cls._is_automation_response = True
        return cls

    return decorator


def automation_interface():
    """Decorator to associate a value as the interface.
    The value should be of type list[HoudiniParmTemplateSpecType]"""

    def decorator(func):
        if not callable(func):
            raise TypeError(
                "@automation_interface can only be used with callable methods"
            )

        @wraps(func)
        def wrapper(*args, **kwargs):
            # Validate the method signature
            if len(args) > 1:
                raise TypeError("automation_interface has no arguments")

            result = func(*args, **kwargs)

            if not isinstance(result, list):
                raise TypeError(
                    "The return value of the automation_interface must be a list of HoudiniParmTemplateSpecType"
                )

            return result

        wrapper._is_automation_interface = True
        return wrapper

    return decorator


def automation():
    """Decorator to associate a method to an automation."""

    def decorator(func):
        if not callable(func):
            raise TypeError("@automation can only be used with callable methods")

        @wraps(func)
        def wrapper(*args, **kwargs):
            # Validate the method signature
            if len(args) < 1 or not isinstance(args[0], ParameterSet):
                raise TypeError(
                    "The first argument of the automation must be a subclass of ParameterSet"
                )

            if (
                    "responder" in kwargs
                    and kwargs["responder"] is not None
                    and not isinstance(kwargs["responder"], ResultPublisher)
            ):
                raise TypeError(
                    "The 'responder' argument must be of type ResultPublisher"
                )

            result = func(*args, **kwargs)

            if not isinstance(result, ProcessStreamItem):
                raise TypeError(
                    "The return value of the automation must be a subclass of ProcessStreamItem"
                )

            return result

        wrapper._is_automation = True
        return wrapper

    return decorator


def _find_decorated_models(
        script_namespace: dict[str, Any],
) -> tuple[ParameterSet | None, ProcessStreamItem | None]:
    """Find request and response models that have been decorated with the appropriate decorators."""
    request_model = None
    response_model = None

    for _, obj in script_namespace.items():
        if hasattr(obj, "_is_automation_request") and obj._is_automation_request:
            request_model = obj
        if hasattr(obj, "_is_automation_response") and obj._is_automation_response:
            response_model = obj

    return request_model, response_model


def _find_operation(script_namespace: dict[str, Any]) -> Callable | None:
    """Find the operation function that has been decorated with @script_operation."""
    for _, obj in script_namespace.items():
        if hasattr(obj, "_is_automation") and obj._is_automation:
            return obj

    return None


def _find_script_interface(
        script_namespace: dict[str, Any],
) -> list[HoudiniParmTemplateSpecType] | None:
    """Find the script interface that has been decorated with @script_interface."""
    for _, obj in script_namespace.items():
        if hasattr(obj, "_is_automation_interface") and obj._is_automation_interface:
            return obj

    return None


def _run_script_automation() -> Callable:
    def impl(
            request: ScriptRequest = None, responder: ResultPublisher = None
    ) -> ProcessStreamItem:
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
            raise ValueError(
                "No request model found. Use @automation_request decorator."
            )

        request_model = request_model_class(**request.request_data.model_dump())

        api_url = meshwork_config().api_base_uri
        resolve_params(api_url, responder.directory, request_model)

        # Find and run the operation function
        operation = _find_operation(script_namespace)
        if operation is None:
            raise ValueError("No operation function found. Use @automation decorator.")

        result = operation(request_model, responder)

        # Ensure ProcessStreamItem response and return it as payload
        if isinstance(result, ProcessStreamItem):
            return result
        else:
            raise ValueError("Operation did not return a ProcessStreamItem.")

    return impl


def _get_script_interface() -> Callable:
    def impl(
            request: ScriptRequest = None, responder: ResultPublisher = None
    ) -> ProcessStreamItem:
        script_namespace = {}

        try:
            exec(request.script, script_namespace)

            # Find request and response models using decorators
            input_model, output_model = _find_decorated_models(script_namespace)
            if input_model is None:
                raise ValueError(
                    "No request model found. Use @script_request_model decorator."
                )

            if output_model is None:
                output_model = ProcessStreamItem

            # Find operation function
            operation = _find_operation(script_namespace)
            if operation is None:
                raise ValueError(
                    "No operation function found. Use @script_operation decorator."
                )
            params_by_name = {}
            for param in input_model.get_parameter_specs():
                params_by_name[param.name] = param

            # read a script Interface model if one exists:
            interface_model = _find_script_interface(script_namespace)
            if interface_model:
                for param in interface_model():
                    params_by_name[param.name] = param
            #
            # Get the parameter spec
            inputs = [param for param in params_by_name.values()]

            return AutomationsResponse(
                automations={
                    "/mythica/script": {
                        "input": inputs,
                        "output": output_model.model_json_schema(),
                        "hidden": True,
                    }
                }
            )
        except Exception as e:
            responder.result(
                Error(error=f"Script Interface Generation Error: {format_exception(e)}")
            )

        return AutomationsResponse(automations={})

    return impl


class ScriptJobDefRequest(ParameterSet):
    awpy_file: FileParameter
    src_asset_id: str
    src_version: list[int]


class ScriptJobDefResponse(ProcessStreamItem):
    item_type: Literal["script_job_def"] = "script_job_def"
    job_definition: JobDefinition


def _get_script_job_def() -> Callable:
    def impl(
            request: ScriptJobDefRequest = None, responder: ResultPublisher = None
    ) -> ScriptJobDefResponse:
        script_namespace = {}
        awpy_file = request.awpy_file
        with open(awpy_file.file_path) as f:
            awpy = json.load(f)

        if len(request.src_asset_id) > 0:
            source = AssetVersionEntryPointReference(
                asset_id=request.src_asset_id,
                major=request.src_version[0],
                minor=request.src_version[1],
                patch=request.src_version[2],
                file_id=awpy_file.file_id,
                entry_point=awpy.get("name"),
            )
        try:
            if not awpy.get("worker"):
                raise ValueError("Worker is required.")

            exec(awpy.get("script"), script_namespace)

            # Find request and response models using decorators
            input_model, output_model = _find_decorated_models(script_namespace)
            if input_model is None:
                raise ValueError(
                    "No request model found. Use @script_request_model decorator."
                )

            if output_model is None:
                output_model = ProcessStreamItem

            # Find operation function
            operation = _find_operation(script_namespace)
            if operation is None:
                raise ValueError(
                    "No operation function found. Use @script_operation decorator."
                )

            params = ParameterSpec(params={})

            # If no interface model is found, use the default parameter spec
            params.params_v2 = input_model.get_parameter_specs()
            # read a script Interface model if one exists:
            interface_model = _find_script_interface(script_namespace)

            if interface_model:
                params.params_v2.extend(interface_model())

            params.default = {"script": awpy.get("script")}

            jd = JobDefinition(
                job_type=f"{request.worker}::/mythica/script",
                name=awpy.get("name"),
                description=awpy.get("description", ""),
                parameter_spec=params,
                owner_id=None,
                source=source,
            )
            responder.result(jd)
            return ScriptJobDefResponse(job_definition=jd)

        except Exception as e:
            responder.result(
                Error(error=f"Script Interface Generation Error: {format_exception(e)}")
            )
            return AutomationsResponse(automations={})

    return impl


def get_default_automations() -> list[AutomationModel]:
    automations: list[AutomationModel] = []
    automations.append(
        AutomationModel(
            path="/mythica/script",
            provider=_run_script_automation(),
            inputModel=ScriptRequest,
            outputModel=ProcessStreamItem,
            hidden=True,
        )
    )
    automations.append(
        AutomationModel(
            path="/mythica/script/interface",
            provider=_get_script_interface(),
            inputModel=ScriptRequest,
            outputModel=AutomationsResponse,
            hidden=True,
        )
    )
    automations.append(
        AutomationModel(
            path="/mythica/script/job_def",
            provider=_get_script_job_def(),
            inputModel=ScriptRequest,
            outputModel=ScriptJobDefResponse,
            hidden=True,
        )
    )

    return automations
