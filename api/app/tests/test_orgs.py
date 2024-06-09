import hashlib
from http import HTTPStatus
from uuid import UUID

from fastapi.testclient import TestClient
from munch import munchify
from uuid import UUID, uuid4
from main import app

from config import app_config
from .profile_test import create_and_auth, ProfileTestInfo
from .org_test import create_org
from .shared_test import api_base


def test_create_update():
    client = TestClient(app)
    profile_test_info = create_and_auth(client)
    headers = profile_test_info.authorization_header()
    o = create_org(client, profile_test_info)
    org_id = o.org.id

    r = client.post(f"{api_base}/orgs/{org_id}",
                    json={'name': 'test-updated'},
                    headers=headers)
    assert r.status_code == HTTPStatus.OK
    o = munchify(r.json())
    assert o.name == "test-updated"
    assert o.description is None
    assert o.updated is not None
    assert o.id == org_id


def test_org_ref_operations():
    client = TestClient(app)
    admin_profile_test_info = create_and_auth(client)
    user_profile_test_info = create_and_auth(client)
    headers = admin_profile_test_info.authorization_header()
    o = create_org(client, admin_profile_test_info)

    org_id = o.org.id
    admin_id = o.admin.profile_id

    # create a new role for the admin
    r = client.post(f"{api_base}/orgs/{org_id}/roles/{admin_profile_test_info.profile.id}/dev", headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 2
    for ref in roles:
        o = munchify(ref)
        assert o.org_id == org_id
        assert o.profile_id == admin_profile_test_info.profile.id
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
        assert o.org_id == org_id
        assert o.created_by == admin_id

        if o.profile_id == user_profile_test_info.profile.id:
            assert o.role in {'user', 'mod'}

    # delete a ref
    r = client.delete(f'{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.id}/mod', headers=headers)
    assert r.status_code == HTTPStatus.OK
    assert len(r.json()) == 3
