"""Organization test cases"""

# pylint: disable=redefined-outer-name

from http import HTTPStatus
from uuid import UUID

from fastapi.testclient import TestClient
from munch import munchify

from main import app
from tests.fixtures.create_org import create_org
from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code


def test_create_update(client, api_base, create_profile, create_org):
    test_profile = create_profile()
    headers = test_profile.authorization_header()
    o = create_org(test_profile)
    org_id = o.org.id

    r = client.post(f"{api_base}/orgs/{org_id}",
                    json={'name': 'test-updated'},
                    headers=headers)
    assert r.status_code == HTTPStatus.OK
    o = munchify(r.json())
    assert o.name == "test-updated"
    assert o.description is None
    assert o.updated is not None
    assert UUID(o.id) == org_id


def test_org_ref_operations(client, api_base, create_profile, create_org):
    client = TestClient(app)
    admin_profile_test_info = create_profile()
    user_profile_test_info = create_profile()
    headers = admin_profile_test_info.authorization_header()
    org = create_org(admin_profile_test_info)
    org2 = create_org(admin_profile_test_info)

    org_id = org.org.id
    org_id2 = org2.org.id
    admin_id = org.admin.profile_id

    # create a new role for the admin
    r = client.post(f"{api_base}/orgs/{org_id}/roles/{admin_profile_test_info.profile.id}/dev", headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 2
    for ref in roles:
        o = munchify(ref)
        assert UUID(o.org_id) == org_id
        assert UUID(o.profile_id) == admin_profile_test_info.profile.id
        assert o.role in {'admin', 'dev'}

    # add two user roles
    r = client.post(f"{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.id}/user", headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 3

    r = client.post(f"{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.id}/mod", headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 4

    for role in roles:
        o = munchify(role)
        assert UUID(o.org_id) == org_id
        assert UUID(o.created_by) == admin_id

        if UUID(o.profile_id) == user_profile_test_info.profile.id:
            assert o.role in {'user', 'mod'}

    # delete a ref
    r = client.delete(f'{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.id}/mod', headers=headers)
    assert r.status_code == HTTPStatus.OK
    assert len(r.json()) == 3

    # create the user role in org2
    r = client.post(f"{api_base}/orgs/{org_id2}/roles/{user_profile_test_info.profile.id}/user", headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 2  # admin and user

    # query the roles for the user
    user_headers = user_profile_test_info.authorization_header()
    r = client.get(f'{api_base}/orgs', headers=user_headers)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 2
    orgs = list()
    for role in r.json():
        o = munchify(role)
        assert UUID(o.profile_id) == user_profile_test_info.profile.id
        assert o.role == 'user'
        assert UUID(o.org_id) in {org_id, org_id2}
        orgs.append(UUID(o.org_id))
    assert org_id in orgs
    assert org_id2 in orgs
