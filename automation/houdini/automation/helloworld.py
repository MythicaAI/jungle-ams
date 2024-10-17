import hou
from ripple.models.params import ParameterSet

class HelloWorldRequest(ParameterSet):
    message: str #Base64 encoded byte string
    

    
def hello_world_api(request: HelloWorldRequest, result_callback):
    result_callback({
        'input_message': f"{request.message}",
        'houdini_version': f"{hou.applicationName()} - {hou.applicationVersionString()}"
    })






