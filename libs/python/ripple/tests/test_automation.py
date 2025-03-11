import logging
from jwt import DecodeError
from pydantic import ValidationError
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient

from ripple.auth.generate_token import generate_token
from ripple.automation.automations import ScriptRequest, _get_script_interface, _run_script_automation, get_default_automations
from ripple.automation.worker import Worker
from ripple.automation.models import AutomationModel, AutomationRequest, AutomationsResponse
from ripple.automation.adapters import NatsAdapter, RestAdapter
from ripple.automation.publishers import ResultPublisher, SlimPublisher
from ripple.models.streaming import CropImageResponse, JobDefinition, Message, OutputFiles, ProcessStreamItem
from ripple.models.params import ParameterSet

from cryptid.cryptid import profile_seq_to_id
# ---- Test Models ----
class TestRequest(ParameterSet):
    __test__=False
    message: str

class TestResponse(Message):
    __test__=False
    pass

# ---- Fixtures ----
@pytest.fixture
def test_token():
    return generate_token(
        profile_seq_to_id(1),
        'test@example.com',
        1,
        'localhost',
        'test',
        [])

@pytest.fixture
def mock_nats():
    mock = AsyncMock(spec=NatsAdapter)
    mock.listen = AsyncMock()
    mock.post = AsyncMock()
    return mock

@pytest.fixture
def mock_rest():
    mock = AsyncMock(spec=RestAdapter)
    return mock

@pytest.fixture
def mock_responder(tmp_path):
    mock = MagicMock(spec=ResultPublisher)
    mock.directory = str(tmp_path)
    mock.result = MagicMock()
    return mock

@pytest.fixture
def worker(mock_nats, mock_rest):
    worker = Worker()
    worker.nats = mock_nats
    worker.rest = mock_rest
    return worker

# ---- Helper Functions ----
def hello_world_api(request: TestRequest, result_callback):
    result_callback(Message(message=f"Received message: {request.message}"))

def get_test_worker_spec() -> dict:
    return {
        '/mythica/hello_world': {
            'input': TestRequest.model_json_schema(),
            'output': TestResponse.model_json_schema(),
            'hidden': False
        }
    }

def get_test_automation() -> dict:
    ret = [
        AutomationModel(
            path = '/mythica/hello_world',
            provider = hello_world_api,
            inputModel = TestRequest,
            outputModel = TestResponse,
            hidden = False
        )
    ]
    return ret


def get_all_worker_specs() -> dict:
    autos = {}

    defaults = get_default_automations()
    for default in defaults:
        autos[default.path] = {
            'input': default.inputModel.model_json_schema(),
            'output': default.outputModel.model_json_schema(),
            'hidden': default.hidden
        }
    autos['/mythica/automations'] = {
        'input': ParameterSet.model_json_schema(),
        'output': AutomationsResponse.model_json_schema(),
        'hidden': True
    }
    return autos

# ---- Worker Initialization Tests ----
def test_worker_init(worker):
    assert isinstance(worker.nats, NatsAdapter)
    assert isinstance(worker.rest, RestAdapter)
    assert '/mythica/automations' in worker.automations

# ---- Automation Loading Tests ----
def test_load_automations(worker):
    worker._load_automations(get_test_automation())
    assert '/mythica/hello_world' in worker.automations
    assert isinstance(worker.automations['/mythica/hello_world'], AutomationModel)

def test_get_catalog_provider(worker):
    provider = worker._get_catalog_provider()
    response = provider()
    expected = AutomationsResponse(automations=get_all_worker_specs())
    assert response.automations == expected.automations

# ---- Executor Tests ----
@pytest.mark.asyncio
async def test_worker_executor(worker, mock_responder, test_token):
    test_automation = AutomationModel(
        path='/test/path',
        provider=lambda x,y: Message(message="test"),
        inputModel=ParameterSet,
        outputModel=Message,
        hidden=False
    )
    worker.automations['/test/path'] = test_automation
    
    with patch('ripple.automation.worker.ResultPublisher', return_value=mock_responder):
        executor = worker._get_executor()
        await executor({
            "process_guid": "test-guid",
            "correlation": "test-work",
            "path": "/test/path",
            "data": {},
            "auth_token": test_token
        })
    
    assert mock_responder.result.call_count == 3
    calls = mock_responder.result.call_args_list
    assert calls[0].args[0].item_type == 'progress'
    assert calls[1].args[0].item_type == 'message'
    assert calls[2].args[0].item_type == 'progress'

# ---- Web Tests ----
def test_start_web(worker):
    with patch.object(worker, '_load_automations') as mock_load:
        app = worker.start_web(get_test_worker_spec())
        mock_load.assert_called_once()
        assert isinstance(app, FastAPI)





@pytest.mark.asyncio
async def test_worker_catalog(worker):
    catalog_provider = worker.automations['/mythica/automations']
    result = catalog_provider.provider(None, None)
    assert isinstance(result, AutomationsResponse)
    assert '/mythica/automations' in result.automations

@pytest.mark.asyncio
async def test_worker_load_automations(worker):
    test_automation = AutomationModel(
        path='/test/path',
        provider=lambda x,y: None,
        inputModel=ParameterSet,
        outputModel=ProcessStreamItem
    )
    worker._load_automations([test_automation])
    assert '/test/path' in worker.automations

@pytest.mark.asyncio
async def test_worker_executor_error(worker):
    executor = worker._get_executor()
    await executor({"invalid": "payload"})
    with pytest.raises(Exception) as exc_info:
    
        assert len(exc_info.value.errors()) == 4
        error_fields = [e["loc"][0] for e in exc_info.value.errors()]
        assert set(error_fields) == {"process_guid", "correlation", "path", "data"}


@pytest.mark.asyncio
async def test_worker_web_executor(worker, test_token):
    app = worker._get_web_executor()
    client = TestClient(app)
    
    response = client.post("/",
        json={
            "correlation": "test-work",
            "path": "/mythica/automations",
            "data": {},
            "auth_token": test_token
        }
    )
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_worker_web_executor_error(worker,test_token):
    app = worker._get_web_executor()
    client = TestClient(app)
    
    with pytest.raises(KeyError):
        response = client.post("/",
            json={
                "correlation": "test-work",
                "path": "/invalid/path",
                "data": {},
                "auth_token": test_token
            }
        )



# ---- Model Test Fixtures ----
@pytest.fixture
def valid_automation_spec():
    return {
        "test_path": {
            "input": {"type": "object"},
            "output": {"type": "object"},
            "hidden": False
        }
    }

@pytest.fixture
def valid_automation_request_data():
    return {
        "process_guid": "123e4567-e89b-12d3-a456-426614174000",
        "correlation": "123e4567-e89b-12d3-a456-426614174001",
        "job_id": "test_job",
        "path": "/test/path",
        "data": {"test": "data"},
        "telemetry_context": {},
    }

# ---- AutomationsResponse Tests ----
class TestAutomationsResponse:
    def test_valid_response(self, valid_automation_spec):
        response = AutomationsResponse(automations=valid_automation_spec)
        assert response.automations == valid_automation_spec
        assert response.item_type == "automationsReponse"

    def test_empty_response(self):
        response = AutomationsResponse(automations={})
        assert response.automations == {}

    def test_invalid_structure(self):
        with pytest.raises(ValidationError):
            AutomationsResponse(automations={"invalid": "structure"})

# ---- AutomationModel Tests ----
class TestAutomationModel:
    def test_valid_model(self):
        model = AutomationModel(
            path="/test/path",
            provider=hello_world_api,
            inputModel=TestRequest,
            outputModel=TestResponse,
            hidden=False
        )
        assert model.path == "/test/path"
        assert model.provider == hello_world_api
        assert model.inputModel == TestRequest
        assert model.outputModel == TestResponse
        assert model.hidden is False

    def test_invalid_provider(self):
        with pytest.raises(ValidationError):
            AutomationModel(
                path="/test/path",
                provider="not_callable",
                inputModel=TestRequest,
                outputModel=TestResponse
            )

# ---- AutomationRequest Tests ----
class TestAutomationRequest:
    def test_valid_request(self, test_token, valid_automation_request_data):
        request_data = valid_automation_request_data.copy()
        request_data["auth_token"] = test_token
        
        request = AutomationRequest(**request_data)
        assert request.process_guid == request_data["process_guid"]
        assert request.correlation == request_data["correlation"]
        assert request.job_id == request_data["job_id"]
        assert request.auth_token == test_token
        assert request.path == request_data["path"]
        assert request.telemetry_context == request_data["telemetry_context"]

    def test_minimal_request(self, valid_automation_request_data):
        minimal_data = {
            "process_guid": valid_automation_request_data["process_guid"],
            "correlation": valid_automation_request_data["correlation"],
            "path": valid_automation_request_data["path"],
            "data": valid_automation_request_data["data"]
        }
        request = AutomationRequest(**minimal_data)
        assert request.job_id is None
        assert request.auth_token is None

    def test_invalid_path(self, valid_automation_request_data):
        invalid_data = valid_automation_request_data.copy()
        invalid_data["path"] = ""
        AutomationRequest(**invalid_data)
        pytest.raises(ValidationError)
            

"""
publishers.py tests
"""
@pytest.fixture
def mock_nats():
    mock = MagicMock(spec=NatsAdapter)
    mock.post_to = AsyncMock()
    mock.subscribe = AsyncMock()
    mock.unsubscribe = AsyncMock()
    return mock

@pytest.fixture
def mock_rest():
    mock = MagicMock(spec=RestAdapter)
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
def test_request(test_token):
    return AutomationRequest(
        process_guid="test-process-guid",
        correlation="test-correlation",
        results_subject="test-results-subject",
        path="/test/path",
        auth_token=test_token,
        data={"test": "data"},
        job_id="test-job-id",
        telemetry_context={"test": "test"},
    )

@pytest.fixture
def mock_profile():
    return {
        "sub": "test-user",
        "profile_id": "test-profile"
    }

@pytest.fixture
def test_file(tmp_path):
    file_path = tmp_path / "test.txt"
    file_path.write_text("test content")
    return str(file_path)

@pytest.fixture
def output_files_item(test_file):
    return OutputFiles(
        item_type="file",  # Changed from "files" to "file"
        process_guid="test-guid",
        files={"test_key": [test_file]}  # Changed field name to 'files'
    )

@pytest.fixture
def job_definition_item():
    return JobDefinition(
        job_type="test_job",
        name="Test Job", 
        description="Test Description",
        parameter_spec={
            "type": "object",
            "properties": {},
            "params": {},  # Adding required params field
            "params_v2": {}  # Adding required params field
        }
    )

@pytest.fixture
def cropped_image_item():
    return CropImageResponse(
        job_type="cropped_image",
        src_asset_id="asset_111", 
        src_version="1.1.1",
        src_file_id="file_111",
        file_path="test.txt",
    )

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

def test_token_handling(test_request):
    test_request.auth_token = None
    with pytest.raises(DecodeError):
        ResultPublisher(
            request=test_request,
            nats_adapter=MagicMock(),
            rest=MagicMock(),
            directory="/tmp"
        )



@pytest.mark.asyncio
async def test_result_publisher_with_job_id(publisher, mock_nats, mock_rest):
    test_item = ProcessStreamItem(item_type="test")
    publisher.request.job_id = "test-job"
    
    publisher.result(test_item)
    
    mock_nats.post_to.assert_called_once()
    mock_rest.post.assert_called_once()

@pytest.mark.asyncio
async def test_result_publisher_complete(publisher, mock_nats, mock_rest, valid_automation_request_data):
    invalid_data = valid_automation_request_data.copy()

    test_item = ProcessStreamItem(item_type="test")
    publisher.request.job_id = "test-job"
    
    publisher.result(test_item, complete=True)
    
    mock_nats.post_to.assert_called_once()
    assert mock_rest.post.call_count == 2
    mock_rest.post.assert_any_call(
        f"{publisher.api_url}/jobs/results/test-job",
        json_data={
            "created_in": "automation-worker",
            "result_data": test_item.model_dump(),
        },
        headers=invalid_data["telemetry_context"],
        token=publisher.request.auth_token
    )
    mock_rest.post.assert_any_call(
        f"{publisher.api_url}/jobs/complete/test-job",
        json_data={},
        headers=invalid_data["telemetry_context"],
        token=publisher.request.auth_token
    )

@pytest.mark.asyncio
async def test_publish_files(publisher, mock_rest, output_files_item):
    mock_rest.post_file.return_value = {"files": [{"file_id": "test-file-id"}]}
    
    publisher._publish_local_data(output_files_item, publisher.api_url)
    
    mock_rest.post_file.assert_called_once()
    assert output_files_item.files["test_key"][0] == "test-file-id"

@pytest.mark.asyncio
async def test_publish_cropped_image(publisher, mock_rest, cropped_image_item, tmp_path, caplog):
    mock_rest.post_file.return_value = {"files": [{"file_id": "file_222", "file_name": "test.txt"}]}
    mock_rest.post.return_value = True
    test_file = tmp_path / "test.txt"
    test_file.write_text("test content")
    cropped_image_item.file_path = str(test_file)

    with caplog.at_level(logging.INFO):
        publisher._publish_local_data(cropped_image_item, publisher.api_url)
    mock_rest.post_file.assert_called_once()
    mock_rest.post.assert_called_once()
    assert any("Added cropped image to contents, item" in message for message in caplog.messages)
    assert cropped_image_item.file_id == "file_222"
    assert cropped_image_item.file_name == "test.txt"


@pytest.mark.asyncio
async def test_publish_missing_cropped_image(publisher, cropped_image_item, caplog):
    # cropped_image_item.file_path = "test_file"

    with caplog.at_level(logging.ERROR):
        publisher._publish_local_data(cropped_image_item, publisher.api_url)
    assert any("Failed to add cropped image to contents" in message for message in caplog.messages)
    assert cropped_image_item.file_id == None
    assert cropped_image_item.file_name == None


@pytest.mark.asyncio
async def test_publish_job_definition(publisher, mock_rest, job_definition_item):
    mock_rest.post.return_value = {"job_def_id": "test-job-def-id"}
    
    publisher._publish_local_data(job_definition_item, publisher.api_url)
    
    mock_rest.post.assert_called_once()
    assert job_definition_item.job_def_id == "test-job-def-id"

def test_slim_publisher_init(test_request, mock_rest, tmp_path):
    slim_publisher = SlimPublisher(test_request, mock_rest, str(tmp_path))
    assert slim_publisher.request == test_request
    assert slim_publisher.rest == mock_rest
    assert slim_publisher.directory == str(tmp_path)

@pytest.mark.asyncio
async def test_slim_publisher_result(test_request, mock_rest, tmp_path):
    slim_publisher = SlimPublisher(test_request, mock_rest, str(tmp_path))
    test_item = ProcessStreamItem(item_type="test")
    
    slim_publisher.result(test_item)
    
    assert test_item.process_guid == test_request.process_guid
    assert test_item.correlation == test_request.correlation
    assert test_item.job_id == ""

@pytest.mark.asyncio
async def test_publish_missing_file(publisher, mock_rest, tmp_path):
    non_existent_file = str(tmp_path / "missing.txt")
    output_files = OutputFiles(
        item_type="files",
        process_guid="test-guid",
        files={"test_key": [non_existent_file]}
    )
    
    publisher._publish_local_data(output_files, publisher.api_url)
    
    mock_rest.post_file.assert_not_called()
    assert output_files.files["test_key"][0] is None

@pytest.mark.asyncio
async def test_publish_missing_file(publisher, mock_rest, tmp_path):
    non_existent_file = str(tmp_path / "missing.txt")
    output_files = OutputFiles(
        item_type="file",  # Changed from "files" to "file"
        process_guid="test-guid",
        files={"test_key": [non_existent_file]}
    )
    
    publisher._publish_local_data(output_files, publisher.api_url)
    mock_rest.post_file.assert_not_called()
    assert output_files.files["test_key"][0] is None


"""
automations.py tests
"""

@pytest.fixture
def valid_script():
    return """
from ripple.models.params import ParameterSet
from ripple.models.streaming import ProcessStreamItem

class RequestModel(ParameterSet):
    name: str

class ResponseModel(ProcessStreamItem):
    item_type: str = "test"
    result: str

def runAutomation(request, responder):
    return ResponseModel(result=f"Hello {request.name}")
"""

@pytest.fixture
def valid_request_data():
    return {"name": "test"}

@pytest.fixture
def mock_responder(tmp_path):
    mock = MagicMock(spec=ResultPublisher)
    mock.directory = str(tmp_path)
    return mock

def test_script_request_validation():
    with pytest.raises(ValidationError):
        ScriptRequest()  # Missing required fields
    
    request = ScriptRequest(script="print('test')", env="staging")
    assert request.env == "staging"
    
    with pytest.raises(ValidationError):
        ScriptRequest(script="print('test')", env="invalid")

@pytest.mark.asyncio
async def test_run_script_automation_success(valid_script, valid_request_data, mock_responder):
    request = ScriptRequest(
        script=valid_script,
        request_data=valid_request_data
    )
    
    automation = _run_script_automation()
    result = automation(request, mock_responder)
    
    assert isinstance(result, ProcessStreamItem)
    assert result.result == "Hello test"

@pytest.mark.asyncio
async def test_run_script_missing_request_data(valid_script, mock_responder):
    request = ScriptRequest(script=valid_script)
    
    automation = _run_script_automation()
    with pytest.raises(ValueError, match="request_data is required"):
        automation(request, mock_responder)

@pytest.mark.asyncio
async def test_run_script_missing_responder(valid_script, valid_request_data):
    request = ScriptRequest(
        script=valid_script,
        request_data=valid_request_data
    )
    
    automation = _run_script_automation()
    with pytest.raises(ValueError, match="responder is required"):
        automation(request, None)

@pytest.mark.asyncio
async def test_run_script_no_request_model(mock_responder):
    script = "print('test')"
    request = ScriptRequest(
        script=script,
        request_data={"test": "value"}
    )
    
    automation = _run_script_automation()
    with pytest.raises(ValueError, match="RequestModel not found"):
        automation(request, mock_responder)

@pytest.mark.asyncio
async def test_run_script_no_automation(mock_responder):
    script = """
from ripple.models.params import ParameterSet

class RequestModel(ParameterSet):
    name: str
"""
    request = ScriptRequest(
        script=script,
        request_data={"name": "test"}
    )
    
    automation = _run_script_automation()
    with pytest.raises(ValueError, match="runAutomation function not found"):
        automation(request, mock_responder)

@pytest.mark.asyncio
async def test_get_script_interface_success(valid_script, mock_responder):
    request = ScriptRequest(script=valid_script)
    
    interface = _get_script_interface()
    result = interface(request, mock_responder)
    
    assert isinstance(result, AutomationsResponse)
    assert result.automations
    assert result.automations['/mythica/script']['input']
    assert result.automations['/mythica/script']['output']

@pytest.mark.asyncio
async def test_get_script_interface_error(mock_responder):
    request = ScriptRequest(script="invalid python code")
    
    interface = _get_script_interface()
    result = interface(request, mock_responder)
    
    assert isinstance(result, AutomationsResponse)
    assert len(result.automations) == 0

def test_get_default_automations():
    automations = get_default_automations()
    
    assert len(automations) == 2
    assert automations[0].path == '/mythica/script'
    assert automations[1].path == '/mythica/script/interface'