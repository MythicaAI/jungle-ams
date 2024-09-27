import hou
from pydantic import BaseModel

class HelloWorldRequest(BaseModel):
    message: str #Base64 encoded byte string
    

    
def hello_world_api(request: HelloWorldRequest, result_callback):
    result_callback({
        'input_message': f"{request.message}",
        'houdini_version': f"{hou.applicationName()} - {hou.applicationVersionString()}"
    })






