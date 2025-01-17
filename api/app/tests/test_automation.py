"""Test automation module."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from nats.aio.client import Client as NATS
from nats import errors
from fastapi import HTTPException

# If you truly need nats_submit or asyncio, re-import them:
# from routes.automation.automation import (AutomationRequest, AutomationResponse,
#                                           automation_request, nats_submit)

from routes.automation.automation import (
    AutomationRequest,
    AutomationResponse,
    automation_request,
)


@pytest.fixture(name="request_data")
def valid_request_data():
    """Fixture: Returns a valid request data dictionary."""
    return {
        "work_guid": "test-guid",
        "channel": "test-channel",
        "path": "/test/path",
        "data": {"test": "data"},
        "auth_token": "test-token",
    }


class AsyncIterator:
    """Asynchronous iterator for mocking async response streams."""

    def __init__(self, items):
        """Initialize with a list of items to iterate over."""
        self._items = items
        self._iter = None

    def __aiter__(self):
        """Begin async iteration."""
        self._iter = iter(self._items)
        return self

    async def __anext__(self):
        """Return the next item from the iterator."""
        try:
            return next(self._iter)
        except StopIteration as exc:
            raise StopAsyncIteration from exc


result_msg = {
    "item_type": "result",
    "correlation": "test-guid",
    "data": {"test": "data"},
}

mock_msg = MagicMock()
mock_msg.data.decode = MagicMock(return_value=json.dumps(result_msg))

mock_response = AsyncMock(
    messages=AsyncIterator([mock_msg]),
    errors=AsyncIterator([]),
)


@pytest.fixture(name="nats")
async def mock_nats():
    """Fixture: Returns a mocked NATS client."""
    mock = AsyncMock(spec=NATS)
    mock.connect = AsyncMock()
    mock.subscribe = AsyncMock(return_value=mock_response)
    mock.publish = AsyncMock()
    mock.flush = AsyncMock()
    mock.close = AsyncMock()
    return mock


class TestAutomationRequest:
    """Tests for the AutomationRequest model."""

    def test_valid_request(self, request_data):
        """Test creating a valid AutomationRequest object."""
        request = AutomationRequest(**request_data)
        assert request.work_guid == request_data["work_guid"]
        assert request.channel == request_data["channel"]
        assert request.path == request_data["path"]
        assert request.data == request_data["data"]
        assert request.auth_token == request_data["auth_token"]

    def test_minimal_request(self):
        """Test creating an AutomationRequest with minimal required fields."""
        minimal_data = {
            "work_guid": "test-guid",
            "channel": "test-channel",
            "path": "/test/path",
            "data": {},
        }
        request = AutomationRequest(**minimal_data)
        assert request.auth_token is None


class TestAutomationEndpoint:
    """Tests for the automation_request endpoint and related functionality."""

    def test_automation_request_endpoint(self, request_data, nats):
        """Test that automation_request sends a publish request to NATS."""
        with patch("nats.connect", return_value=nats):
            response = automation_request(AutomationRequest(**request_data))
            assert isinstance(response, AutomationResponse)
            assert response.work_guid == request_data["work_guid"]
            nats.publish.assert_awaited_once()

    def test_automation_request_connection_error(self, request_data):
        """Test that automation_request raises HTTPException on NATS connection error."""
        with patch("nats.connect", side_effect=errors.ConnectionClosedError()):
            with pytest.raises(HTTPException) as exc_info:
                automation_request(AutomationRequest(**request_data))
            assert exc_info.value.status_code == 503

    def test_automation_request_timeout(self, request_data):
        """Test that automation_request raises HTTPException on NATS timeout."""
        with patch("nats.connect", side_effect=errors.TimeoutError()):
            with pytest.raises(HTTPException) as exc_info:
                automation_request(AutomationRequest(**request_data))
            assert exc_info.value.status_code == 504

    def test_automation_request_no_servers(self, request_data):
        """Test that automation_request raises HTTPException when no NATS servers are available."""
        with patch("nats.connect", side_effect=errors.NoServersError()):
            with pytest.raises(HTTPException) as exc_info:
                automation_request(AutomationRequest(**request_data))
            assert exc_info.value.status_code == 503


def test_automation_request_missing_work_guid():
    """Test that AutomationRequest requires 'work_guid'."""
    invalid_data = {
        "channel": "test-channel",
        "path": "/test/path",
        "data": {},
    }
    with pytest.raises(ValueError):
        AutomationRequest(**invalid_data)
