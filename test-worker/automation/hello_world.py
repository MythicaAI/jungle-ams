import time
from typing import Optional
from meshwork.models.streaming import Message
from meshwork.models.params import ParameterSet
from meshwork.models.streaming import Message


class HelloWorldRequest(ParameterSet):
    message: Optional[str] = ""  # Base64 encoded byte string


class HelloWorldResponse(Message):
    pass


def hello_world_api(request: HelloWorldRequest, result_callback):
    time.sleep(3)
    return Message(message=f"Received message: {request.message}")
