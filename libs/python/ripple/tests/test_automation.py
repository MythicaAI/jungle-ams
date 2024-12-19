import pytest
from unittest.mock import patch

from ripple.automation.models import AutomationModel, AutomationsResponse
from ripple.automation.worker import Worker, process_guid
from ripple.automation.automations import get_default_automations
from ripple.models.params import ParameterSet
from ripple.models.streaming import Message
from ripple.auth.generate_token import generate_token

# Test request/response models

class TestRequest(ParameterSet):
    __test__ = False  
    message: str

class TestResponse(Message):
    __test__ = False  
    pass

def hello_world_api(request: TestRequest, result_callback):
    __test__ = False  
    result_callback(Message(message=f"Received message: {request.message}"))

@pytest.fixture
def worker() -> Worker:
    w = Worker()
    w.automations = {
        '/mythica/hello_world': AutomationModel(
            path = '/mythica/hello_world',
            provider = hello_world_api,
            inputModel = TestRequest,
            outputModel = TestResponse,
            hidden = False
        ),
    }
    return w

def test_automation() -> dict:
    __test__ = False  
    return {
       '/mythica/hello_world': {
            'input': TestRequest.model_json_schema(),
            'output': TestResponse.model_json_schema(),
            'hidden': False
        },
    }

def all_automations() -> dict:
    __test__ = False  
    autos = test_automation()
    defaults = get_default_automations()
    for default in defaults:
        autos[default.path] = {
            'input': default.inputModel.model_json_schema(),
            'output': default.outputModel.model_json_schema(),
            'hidden': default.hidden
        }
    return autos

def test_load_automations(worker):
    # Test that _load_automations correctly loads automations into the dictionary
    new_auto = [
        AutomationModel(
            path='/mythica/new_auto',
            provider=lambda x, y: None,
            inputModel=ParameterSet,
            outputModel=Message,
            hidden=True
        )
    ]
    worker._load_automations(new_auto)
    assert '/mythica/new_auto' in worker.automations
    assert isinstance(worker.automations['/mythica/new_auto'], AutomationModel)

def test_get_catalog_provider(worker):
    provider = worker._get_catalog_provider()
    response = provider()

    expected_response = AutomationsResponse(automations=test_automation())


    assert response.automations == expected_response.automations


def test_start_web(worker):
    with patch.object(worker, '_load_automations') as mock_load:
        app = worker.start_web(all_automations())
        mock_load.assert_called_once()
        # app should be a FastAPI instance
        from fastapi import FastAPI
        assert isinstance(app, FastAPI)



