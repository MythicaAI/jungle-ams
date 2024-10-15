import bpy
from pydantic import BaseModel

class HelloWorldRequest(BaseModel):
    message: str #Base64 encoded byte string
    

    
def hello_world_api(request: HelloWorldRequest, result_callback):
    result_callback({
        'input_message': f"{request.message}",
        'blender_version': f"Blender Python Module - {bpy.app.version_string}"
    })






