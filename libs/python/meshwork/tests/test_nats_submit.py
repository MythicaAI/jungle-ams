import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json
from nats.errors import ConnectionClosedError, TimeoutError
from nats.aio.client import Client as NATS

from meshwork.automation.utils import __nats_submit


@pytest.fixture(name="request_data")
def request_data_fixture():
    """Fixture: Returns a valid request data dictionary."""
    return {
        "correlation": "test-guid",
        "channel": "test-channel",
        "path": "/test/path",
        "data": {"test": "data"},
        "auth_token": "test-token",
    }


@pytest.fixture(name="async_iterator")
def async_iterator_fixture():
    """Create async iterator fixture."""

    class AsyncIterator:
        """Async iterator class."""

        def __init__(self, items):
            self._items = items
            self._iter = None

        def __aiter__(self):
            self._iter = iter(self._items)
            return self

        async def __anext__(self):
            try:
                return next(self._iter)
            except StopIteration as exc:
                raise StopAsyncIteration from exc

    return AsyncIterator


@pytest.fixture(name="mock_message")
def mock_message_fixture():
    """Create mock NATS message."""
    result_msg = {
        "item_type": "result",
        "correlation": "test-guid",
        "data": {"test": "data"},
    }
    mock = MagicMock()
    mock.data.decode = MagicMock(return_value=json.dumps(result_msg))
    return mock


@pytest.fixture(name="mock_response")
def mock_response_fixture(async_iterator, mock_message):
    """Create mock NATS response."""
    return AsyncMock(
        messages=async_iterator([mock_message]),
        errors=async_iterator([]),
    )


@pytest.fixture(name="nats")
def mock_nats_fixture(mock_response):
    """Fixture: Returns a mocked NATS client."""
    mock = AsyncMock(spec=NATS)
    mock.connect = AsyncMock()
    mock.subscribe = AsyncMock(return_value=mock_response)
    mock.publish = AsyncMock()
    mock.flush = AsyncMock()
    mock.close = AsyncMock()
    return mock


@pytest.mark.asyncio
async def test_nats_submit_success(nats):
    """Test successful NATS submission."""
    test_data = {
        "channel": "test-channel",
        "path": "/test/path",
        "data": {"test": "value"},
        "correlation": "test-guid",
        "auth_token": "test-token"
    }

    with patch('nats.connect', return_value=nats):
        result = await __nats_submit(**test_data)

        assert isinstance(result, list)
        assert len(result) > 0
        assert result[0]["data"]["test"] == "data"
        nats.publish.assert_called_once()


@pytest.mark.asyncio
async def test_nats_submit_connection_error():
    """Test NATS connection error handling."""
    with patch('nats.connect', side_effect=ConnectionClosedError()):
        with pytest.raises(ConnectionClosedError):
            await __nats_submit(
                channel="test-channel",
                path="/test/path",
                data={},
                correlation="test-guid",
                auth_token="test-token"
            )


@pytest.mark.asyncio
async def test_nats_submit_timeout():
    """Test NATS timeout handling."""

    with patch('nats.connect', side_effect=TimeoutError()):
        with pytest.raises(TimeoutError):
            await __nats_submit(
                channel="test-channel",
                path="/test/path",
                data={},
                correlation="test-guid",
                auth_token="test-token"
            )


@pytest.mark.asyncio
async def test_nats_submit_cleanup(nats):
    """Test NATS client cleanup."""
    with patch('nats.connect', return_value=nats):
        await __nats_submit(
            channel="test-channel",
            path="/test/path",
            data={},
            correlation="test-guid",
            auth_token="test-token"
        )
        nats.close.assert_called_once()
