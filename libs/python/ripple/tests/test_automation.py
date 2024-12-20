from pydantic import ValidationError
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from ripple.automation.adapters import NatsAdapter, RestAdapter
from ripple.automation.models import AutomationModel, AutomationRequest, AutomationsResponse
from ripple.automation.publishers import ResultPublisher
from ripple.automation.worker import Worker, process_guid
from ripple.automation.automations import get_default_automations
from ripple.models.params import ParameterSet
from ripple.models.streaming import Message, ProcessStreamItem
from ripple.auth.generate_token import generate_token

from cryptid.cryptid import profile_seq_to_id

# Test request/response models
def get_auth_token():
    return generate_token(
        profile_seq_to_id(1),
        'test@example.com',
        1,
        'localhost',
        'test',
        [])

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

@pytest.mark.skip
def default_automation() -> dict:
    __test__ = False  
    return {
       '/mythica/hello_world': {
            'input': TestRequest.model_json_schema(),
            'output': TestResponse.model_json_schema(),
            'hidden': False
        },
    }

@pytest.mark.skip
def all_automations() -> dict:
    __test__ = False  
    autos = default_automation()
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

    expected_response = AutomationsResponse(automations=default_automation())


    assert response.automations == expected_response.automations


def test_start_web(worker):
    with patch.object(worker, '_load_automations') as mock_load:
        app = worker.start_web(all_automations())
        mock_load.assert_called_once()
        # app should be a FastAPI instance
        from fastapi import FastAPI
        assert isinstance(app, FastAPI)


class TestInputModel(ParameterSet):
    __test__= False
    test_param: str

class TestOutputModel(ProcessStreamItem):
    __test__= False
    item_type: str = "test"
    result: str


@pytest.mark.skip
def default_provider():
    return {"result": "test"}

def test_automations_response():
    # Valid response
    valid_automations = {
        "test_path": {
            "input": {"type": "object"},
            "output": {"type": "object"},
            "hidden": False
        }
    }
    response = AutomationsResponse(automations=valid_automations)
    assert response.automations == valid_automations
    assert response.item_type == "automationsReponse"

    # Empty automations
    empty_response = AutomationsResponse(automations={})
    assert empty_response.automations == {}

    # Invalid structure should raise ValidationError
    with pytest.raises(ValidationError):
        AutomationsResponse(automations={"invalid": "structure"})

def test_automation_model():
    # Valid model
    model = AutomationModel(
        path="/test/path",
        provider=default_provider,
        inputModel=TestInputModel,
        outputModel=TestOutputModel,
        hidden=False
    )
    assert model.path == "/test/path"
    assert model.provider == default_provider
    assert model.inputModel == TestInputModel
    assert model.outputModel == TestOutputModel
    assert model.hidden is False

    # Provider must be callable
    with pytest.raises(ValidationError):
        AutomationModel(
            path="/test/path",
            provider="not_callable",
            inputModel=TestInputModel,
            outputModel=TestOutputModel
        )

def test_automation_request():
    # Valid request
    valid_request = AutomationRequest(
        process_guid="123e4567-e89b-12d3-a456-426614174000",
        work_guid="123e4567-e89b-12d3-a456-426614174001",
        job_id="test_job",
        auth_token=get_auth_token(),
        path="/test/path",
        data={"test": "data"}
    )
    assert valid_request.process_guid == "123e4567-e89b-12d3-a456-426614174000"
    assert valid_request.work_guid == "123e4567-e89b-12d3-a456-426614174001"
    assert valid_request.job_id == "test_job"
    assert valid_request.auth_token == get_auth_token()
    assert valid_request.path == "/test/path"

    # Optional fields
    minimal_request = AutomationRequest(
        process_guid="123e4567-e89b-12d3-a456-426614174000",
        work_guid="123e4567-e89b-12d3-a456-426614174001",
        path="/test/path",
        data={"test": "data"}
    )
    assert minimal_request.job_id is None
    assert minimal_request.auth_token is None

    # Empty path should raise ValidationError
    with pytest.raises(ValidationError):
        AutomationRequest(
            process_guid="123e4567-e89b-12d3-a456-426614174000",
            work_guid="123e4567-e89b-12d3-a456-426614174001",
            path=""
        )


@pytest.fixture
def mock_nats():
    mock = MagicMock(spec=NatsAdapter)
    # Add required attributes/methods
    mock.post_to = AsyncMock()
    mock.subscribe = AsyncMock()
    mock.unsubscribe = AsyncMock()
    return mock

@pytest.fixture
def mock_rest():
    mock = MagicMock(spec=RestAdapter)
    # Add required attributes/methods
    mock.post = MagicMock()
    mock.download_file = AsyncMock()
    return mock

@pytest.fixture
def publisher(mock_nats, mock_rest, test_request, mock_profile, tmp_path):
    with patch('ripple.automation.publishers.decode_token', return_value=mock_profile):
        with patch('ripple.automation.publishers.ripple_config') as mock_config:
            mock_config.return_value.api_base_uri = "http://test-api"
            return ResultPublisher(
                request=test_request,
                nats_adapter=mock_nats,
                rest=mock_rest,
                directory=str(tmp_path),
            )

@pytest.fixture
def test_request():
    return AutomationRequest(
        process_guid="test-process-guid",
        work_guid="test-work-guid",
        path="/test/path",
        auth_token=get_auth_token(),
        data={"test": "data"},
        job_id="test-job-id"
    )

@pytest.fixture
def mock_profile():
    return {
        "sub": "test-user",
        "profile_id": "test-profile"
    }


def test_publisher_init(publisher, test_request, mock_profile):
    assert publisher.request == test_request
    assert publisher.profile == mock_profile
    assert publisher.api_url == "http://test-api"

@pytest.mark.asyncio
async def test_result_publishing(publisher, mock_nats):
    test_item = ProcessStreamItem(item_type="test")
    
    # Test regular result
    publisher.result(test_item)
    mock_nats.post_to.assert_called_once()
    
    # Test completion
    publisher.result(test_item, complete=True)
    assert mock_nats.post_to.call_count == 2

def test_error_handling(publisher):
    with pytest.raises(AttributeError):
        publisher.result(None)

@pytest.mark.asyncio
async def test_file_handling(publisher, mock_rest, tmp_path):
    test_file = tmp_path / "test.txt"
    test_file.write_text("test content")
    
    test_item = ProcessStreamItem(
        item_type="file",
        file_path=str(test_file)
    )
    
    publisher.result(test_item)
    mock_rest.post.assert_called_once()

