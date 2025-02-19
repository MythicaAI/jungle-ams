"""Topology tests"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

import pytest
from munch import munchify

from tests.fixtures.create_org import create_org
from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code, random_str

json_schema = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "name": {"type": "string"},
    }
}


@pytest.mark.asyncio
async def test_create_update(api_base, client, create_profile, create_org):
    topo_name = "test-topo-" + random_str(10)
    topo_name_updated = topo_name + "-updated"
    invalid_org = 'foobar'
    test_profile = await create_profile()
    org_and_admin = create_org(test_profile)
    org_id = org_and_admin.org_id
    admin_id = org_and_admin.profile_id
    headers = test_profile.authorization_header()

    assert admin_id == test_profile.profile.profile_id

    # validate that topo can't be created with invalid orgs
    r = client.post(f'{api_base}/topos',
                    json={'name': topo_name, 'org_id': invalid_org},
                    headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # validate that names conform to schema
    r = client.post(f'{api_base}/topos',
                    json={'name': "name with space", "org_id": org_id},
                    headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # create valid
    r = client.post(f'{api_base}/topos',
                    json={'name': topo_name, 'org_id': org_id},
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o.name == topo_name
    assert o.org_id == org_id
    topo_id = o.topology_id

    # validate that another topo can't have the same name
    r = client.post(f'{api_base}/topos',
                    json={'name': topo_name, "org_id": org_id},
                    headers=headers)
    assert_status_code(r, HTTPStatus.CONFLICT)

    # invalid org update
    r = client.post(f'{api_base}/topos/{topo_id}',
                    json={"name": topo_name_updated, "org_id": invalid_org},
                    headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # validate that names conform to schema in update
    r = client.post(f'{api_base}/topos',
                    json={'name': "name with space", "org_id": org_id},
                    headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # valid org update
    r = client.post(f'{api_base}/topos/{topo_id}',
                    json={"name": topo_name_updated, "org_id": org_id},
                    headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o.name == topo_name_updated
    assert o.org_id == org_id

    # get the zero refs
    r = client.get(f'{api_base}/topos/{topo_id}/refs')
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 0

    # create asset refs
    src_asset_name = 'test-src-asset'
    dst_asset_name = 'test-dst-asset'
    r = client.post(f'{api_base}/assets',
                    json={"name": src_asset_name},
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    src_asset_id = o.asset_id
    r = client.post(f'{api_base}/assets',
                    json={"name": dst_asset_name},
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    dst_asset_id = o.asset_id

    # create a src only ref
    edge_data = {"foo": "bar"}
    r = client.post(f'{api_base}/topos/{topo_id}/refs/{src_asset_id}/{dst_asset_id}',
                    json=edge_data,
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o.src_id == src_asset_id
    assert o.dst_id == dst_asset_id
    assert o.edge_data == edge_data

    r = client.get(f'{api_base}/topos/{topo_id}/refs')
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 1
