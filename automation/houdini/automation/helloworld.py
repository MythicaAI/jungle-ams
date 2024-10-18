import hou
from ripple.models.params import ParameterSet
from ripple.automation import ResultPublisher
class HelloWorldRequest(ParameterSet):
    message: str #Base64 encoded byte string
    

    
def hello_world_api(request: HelloWorldRequest, responder: ResultPublisher):
    responder.result({
        'input_message': f"{request.message}",
        'houdini_version': f"{hou.applicationName()} - {hou.applicationVersionString()}"
    })






