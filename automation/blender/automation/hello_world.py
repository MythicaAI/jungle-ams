import bpy
from ripple.models.params import ParameterSet
from ripple.automation import ResultPublisher
from ripple.models.streaming import ProcessStreamItem
from typing import Literal
class HelloWorldRequest(ParameterSet):
    message: str #Base64 encoded byte string
    
class HelloWorldResponse(ProcessStreamItem):
    item_type: Literal["helloWorld"] = "helloWorld"
    input_message: str
    provider: str
    
def hello_world_api(request: HelloWorldRequest, responder: ResultPublisher)->HelloWorldResponse:
    return HelloWorldResponse(
        input_message= request.message,
        provider= f"Blender Python Module - {bpy.app.version_string}"
    )






