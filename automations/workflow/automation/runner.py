from meshwork.automation.publishers import ResultPublisher
from meshwork.models.streaming import Message
from meshwork.models.params import ParameterSet, FileParameter
from meshwork.models.streaming import Message

from meshwork.automation.workflow import parse
import json


class RunnerRequest(ParameterSet):
    awful: FileParameter


class RunnerResponse(Message):
    pass


def runner_api(request: RunnerRequest, reporter: ResultPublisher) -> RunnerResponse:
    with open(request.awful.file_path) as f:
        awful = json.load(f)

    workflow = parse(awful)

    return Message(message=f"Received message: {workflow}")
