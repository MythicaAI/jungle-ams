from http import HTTPStatus

from fastapi.testclient import TestClient

from main import app
from .shared_test import assert_status_code

client = TestClient(app)


def test_asset_all(api_base):
    response = client.get(f"{api_base}/assets/all")
    assert_status_code(response, HTTPStatus.OK)
