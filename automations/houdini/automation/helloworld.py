import hou
from meshwork.models.params import ParameterSet
from meshwork.models.streaming import ProcessStreamItem
from meshwork.automation.publishers import ResultPublisher
from typing import Literal


class HelloWorldRequest(ParameterSet):
    message: str  # Base64 encoded byte string


class HelloWorldResponse(ProcessStreamItem):
    item_type: Literal["hello"] = "hello"
    input_message: str
    provider: str


def hello_world_api(request: HelloWorldRequest, responder: ResultPublisher) -> HelloWorldResponse:
    return HelloWorldResponse(
        input_message=request.message,
        provider=f"{hou.applicationName()} - {hou.applicationVersionString()}"
    )
