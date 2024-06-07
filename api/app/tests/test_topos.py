import hashlib
from http import HTTPStatus
from uuid import UUID

from fastapi.testclient import TestClient
from munch import munchify
from uuid import UUID, uuid4
from main import app

from config import app_config

client = TestClient(app)
api_base = "/api/v1"

json_schema = {
    "type": "object",
    "properties": {
        "uuid": {"type": "string"},
        "name": {"type": "string"},
    }
}

def test_create_update():
    topo_name = "test-topo"
    topo_name_updated = "test-topo-updated"
    invalid_org = uuid4()

    # create org

    # validate that they can't be created with invalid orgs
    r = client.post("{api_base}/topologies", json={"name": topo_name, "org": invalid_org})
    assert r.status_code == HTTPStatus.NO_CONTENT

    r = client.post(f"{api_base}/topologies", json={"name": topo_name})

    r = client.post("{api_base}/topologies/{id}", json={"name": topo_name_updated, "org": invalid_org})
    assert r.status_code == HTTPStatus.NO_CONTENT

