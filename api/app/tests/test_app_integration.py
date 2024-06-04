from fastapi.testclient import TestClient

from main import app

from config import app_config

client = TestClient(app)


def test_create_profile():
    response = client.post("/api/v1/profiles/create",
                           json={"name": "foo"})
    assert response.json == {}

def test_create_asset():
    """Test a full asset creation run through the API"""

    assets = client.get("/api/v1/assets")
    assert len(assets) > 0
