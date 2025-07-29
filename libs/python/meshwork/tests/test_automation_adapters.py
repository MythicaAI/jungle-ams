"""
adapters.py tests
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from meshwork.automation.adapters import NatsAdapter, RestAdapter


@pytest.fixture
def mock_nats_connection():
    with patch("nats.connect") as mock_connect:
        mock_nc = AsyncMock()
        mock_connect.return_value = mock_nc
        yield mock_nc


@pytest.fixture
def mock_requests():
    with patch("requests.post") as mock_post, patch("requests.get") as mock_get:
        mock_post.return_value = MagicMock(status_code=200)
        mock_get.return_value = MagicMock(status_code=200)
        yield mock_post, mock_get


@pytest.mark.asyncio
async def test_nats_subject_scoping():
    adapter = NatsAdapter()
    subject = adapter._scoped_subject("test")
    assert subject == f"test.{adapter.env}.{adapter.location}"

    scoped = adapter._scoped_subject_to("test", "entity")
    assert scoped == f"test.{adapter.env}.{adapter.location}.entity"


@pytest.mark.asyncio
async def test_nats_post(mock_nats_connection):
    adapter = NatsAdapter()
    await adapter.post("test", {"data": "test"})
    mock_nats_connection.publish.assert_called_once()
    assert adapter.nc is None  # Should disconnect after post


@pytest.mark.asyncio
async def test_nats_listen(mock_nats_connection):
    adapter = NatsAdapter()
    callback = AsyncMock()

    await adapter.listen("test", callback)
    mock_nats_connection.subscribe.assert_called_once()
    # Fix: Use correct hostname in assertion
    assert f"test.{adapter.env}.{adapter.location}" in adapter.listeners

    # Test message handling
    msg = MagicMock()
    msg.data = json.dumps({"test": "data"}).encode()
    handler = mock_nats_connection.subscribe.call_args[1]["cb"]
    await handler(msg)
    callback.assert_called_once()


@pytest.mark.asyncio
async def test_nats_unlisten(mock_nats_connection):
    adapter = NatsAdapter()
    subject = f"test.{adapter.env}.{adapter.location}"
    await adapter.listen("test", AsyncMock())
    await adapter.unlisten(subject)
    assert not adapter.listeners


def test_rest_get(mock_requests):
    _, mock_get = mock_requests
    mock_get.return_value.json.return_value = {"data": "test"}

    adapter = RestAdapter()
    result = adapter.get("http://test", token="test-token")

    assert result == {"data": "test"}
    mock_get.assert_called_with(
        "http://test",
        headers={"traceparent": None, "Authorization": "Bearer test-token"},
    )


def test_rest_post(mock_requests):
    mock_post, _ = mock_requests
    mock_post.return_value.json.return_value = {"id": "test"}

    adapter = RestAdapter()
    result = adapter.post("http://test", json_data={"data": "test"}, token="test-token")

    assert result == {"id": "test"}
    mock_post.assert_called_with(
        "http://test",
        json={"data": "test"},
        params={},
        headers={
            "traceparent": None,
            "Content-Type": "application/json",
            "Authorization": "Bearer test-token",
        },
    )


def test_rest_post_file(mock_requests):
    mock_post, _ = mock_requests
    mock_post.return_value.json.return_value = {"file_id": "test"}

    adapter = RestAdapter()
    result = adapter.post_file(
        "http://test", file_data=[("file", "content")], token="test-token"
    )

    assert result == {"file_id": "test"}
    mock_post.assert_called_with(
        "http://test",
        files=[("file", "content")],
        headers={"traceparent": None, "Authorization": "Bearer test-token"},
    )


def test_rest_error_handling(mock_requests):
    mock_post, mock_get = mock_requests
    mock_post.return_value.status_code = 500
    mock_get.return_value.status_code = 500

    adapter = RestAdapter()
    assert adapter.get("http://test") is None
    assert adapter.post("http://test", {}, "token") is None
    assert adapter.post_file("http://test", [], "token") is None


@pytest.mark.asyncio
async def test_nats_post_error(mock_nats_connection):
    mock_nats_connection.publish.side_effect = Exception("Test error")
    adapter = NatsAdapter()
    await adapter.post("test", {"data": "test"})
    mock_nats_connection.publish.assert_called_once()


@pytest.mark.asyncio
async def test_nats_message_handler_error(mock_nats_connection):
    adapter = NatsAdapter()
    callback = AsyncMock(side_effect=Exception("Test error"))

    await adapter.listen("test", callback)
    msg = MagicMock()
    msg.data = json.dumps({"test": "data"}).encode()
    handler = mock_nats_connection.subscribe.call_args[1]["cb"]
    await handler(msg)


@pytest.mark.asyncio
async def test_nats_listen_duplicate(mock_nats_connection):
    adapter = NatsAdapter()
    callback = AsyncMock()
    subject = f"test.{adapter.env}.{adapter.location}"

    await adapter.listen("test", callback)
    await adapter.listen("test", callback)  # Should log warning
    assert len(adapter.listeners) == 1
    assert subject in adapter.listeners


@pytest.mark.asyncio
async def test_nats_unlisten_missing(mock_nats_connection):
    adapter = NatsAdapter()
    await adapter.unlisten("nonexistent")  # Should log warning


def test_rest_get_error(mock_requests):
    _, mock_get = mock_requests
    mock_get.return_value.status_code = 500

    adapter = RestAdapter()
    result = adapter.get("http://test", token="test-token")
    assert result is None


def test_rest_post_error(mock_requests):
    mock_post, _ = mock_requests
    mock_post.return_value.status_code = 500

    adapter = RestAdapter()
    result = adapter.post("http://test", {"data": "test"}, "test-token")
    assert result is None


def test_rest_post_file_error(mock_requests):
    mock_post, _ = mock_requests
    mock_post.return_value.status_code = 500

    adapter = RestAdapter()
    result = adapter.post_file("http://test", [("file", "content")], "test-token")
    assert result is None
