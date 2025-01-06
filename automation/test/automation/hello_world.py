import time
from typing import Optional
from ripple.models.streaming import Message
from ripple.models.params import ParameterSet
from ripple.models.streaming import Message

class HelloWorldRequest(ParameterSet):
    message: Optional[str] = "" #Base64 encoded byte string

class HelloWorldResponse(Message):
    pass

def hello_world_api(request: HelloWorldRequest, result_callback):
    time.sleep(1)
    return Message(message=f"Received message: {request.message}")



