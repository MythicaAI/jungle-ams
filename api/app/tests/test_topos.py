from http import HTTPStatus

from fastapi.testclient import TestClient
from munch import munchify
from uuid import uuid4
from main import app

from .shared_test import api_base, get_random_string
from .profile_test import create_and_auth
from .org_test import create_org

client = TestClient(app)

json_schema = {
    "type": "object",
    "properties": {
        "uuid": {"type": "string"},
        "name": {"type": "string"},
    }
}


def test_create_update():
    topo_name = "test-topo-" + get_random_string(10)
    topo_name_updated = topo_name + "-updated"
    invalid_org = str(uuid4())
    test_profile = create_and_auth(client)
    org_and_admin = create_org(client, test_profile)
    org_id = org_and_admin.org.id
    admin_id = org_and_admin.admin.profile_id
    headers = test_profile.authorization_header()

    assert admin_id == test_profile.profile.id

    # validate that topo can't be created with invalid orgs
    r = client.post(f'{api_base}/topos',
                    json={'name': topo_name, "org_id": invalid_org},
                    headers=headers)
    assert r.status_code == HTTPStatus.FAILED_DEPENDENCY

    # validate that names conform to schema
    r = client.post(f'{api_base}/topos',
                    json={'name': "name with space", "org_id": org_id},
                    headers=headers)
    assert r.status_code == HTTPStatus.BAD_REQUEST

    # create valid
    r = client.post(f'{api_base}/topos',
                    json={'name': topo_name, 'org_id': org_id},
                    headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    o = munchify(r.json())
    assert o.name == topo_name
    assert o.org_id == org_id
    topo_id = o.id

    # validate that another topo can't have the same name
    r = client.post(f'{api_base}/topos',
                    json={'name': topo_name, "org_id": org_id},
                    headers=headers)
    assert r.status_code == HTTPStatus.CONFLICT

    # invalid org update
    r = client.post(f'{api_base}/topos/{topo_id}',
                    json={"name": topo_name_updated, "org_id": invalid_org},
                    headers=headers)
    assert r.status_code == HTTPStatus.FAILED_DEPENDENCY

    # validate that names conform to schema in update
    r = client.post(f'{api_base}/topos',
                    json={'name': "name with space", "org_id": org_id},
                    headers=headers)
    assert r.status_code == HTTPStatus.BAD_REQUEST

    # valid org update
    r = client.post(f'{api_base}/topos/{topo_id}',
                    json={"name": topo_name_updated, "org_id": org_id},
                    headers=headers)
    assert r.status_code == HTTPStatus.OK
    o = munchify(r.json())
    assert o.name == topo_name_updated
    assert o.org_id == org_id

    # get the zero refs
    r = client.get(f'{api_base}/topos/{topo_id}/refs')
    assert r.status_code == HTTPStatus.OK
    assert len(r.json()) == 0

    # create asset refs
    src_asset_name = 'test-src-asset'
    dst_asset_name = 'test-dst-asset'
    r = client.post(f'{api_base}/assets',
                    json={"name": src_asset_name},
                    headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    o = munchify(r.json())
    src_asset_id = o.id
    r = client.post(f'{api_base}/assets',
                    json={"name": dst_asset_name},
                    headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    o = munchify(r.json())
    dst_asset_id = o.id

    # create a src only ref
    edge_data = {"foo": "bar"}
    r = client.post(f'{api_base}/topos/{topo_id}/refs/{src_asset_id}/{dst_asset_id}',
                    json=edge_data,
                    headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    o = munchify(r.json())
    assert o.topology_id == topo_id
    assert o.src == src_asset_id
    assert o.dst == dst_asset_id
    assert o.edge_data == edge_data

    r = client.get(f'{api_base}/topos/{topo_id}/refs')
    assert r.status_code == HTTPStatus.OK
    assert len(r.json()) == 1
