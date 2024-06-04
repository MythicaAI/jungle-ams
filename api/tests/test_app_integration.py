from fastapi.testclient import TestClient

from .main import app

client = TestClient(app)

def test_create_asset():
    """Test a full asset creation run through the API"""
