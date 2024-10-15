import bpy
from pydantic import BaseModel
from ripple.automation import ResultPublisher

class HelloWorldRequest(BaseModel):
    message: str #Base64 encoded byte string
    

    
def hello_world_api(request: HelloWorldRequest, responder: ResultPublisher):
    responder.result({
        'input_message': f"{request.message}",
        'blender_version': f"Blender Python Module - {bpy.app.version_string}"
    })






