from pydantic import BaseModel
from ripple.models.streaming import Message

class HelloWorldRequest(BaseModel):
    message: str #Base64 encoded byte string
    

def hello_world_api(request: HelloWorldRequest, result_callback):
    result_callback(Message(message=f"Received message: {request.message}"))



