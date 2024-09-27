from pydantic import BaseModel

class HelloWorldRequest(BaseModel):
    message: str #Base64 encoded byte string
    

def hello_world_api(request: HelloWorldRequest, result_callback):
    result_callback({'reply' :f"Received message: {request.message}"})



