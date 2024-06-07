import hashlib
from http import HTTPStatus
from uuid import UUID

from fastapi.testclient import TestClient
from munch import munchify
from uuid import UUID, uuid4
from main import app

from config import app_config
from .profile_test import create_and_auth, ProfileTestInfo

api_base = "/api/v1/"


def create_org(client: TestClient, profile_test_info: ProfileTestInfo):
    headers = profile_test_info.authorization_header()
    test_org_name = 'test-org'
    test_org_description = 'test org description'

    r = client.post(f"{api_base}orgs",
                    json={
                        'name': test_org_name,
                        'description': test_org_description},
                    headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    o = munchify(r.json())
    assert o.org is not None
    assert o.admin is not None
    assert o.org.name == test_org_name
    assert o.org.description == test_org_description
    assert o.org.created is not None
    assert o.org.updated is None
    assert o.admin.profile_id == profile_test_info.profile.id
    assert o.admin.org_id == o.org.id
    assert o.admin.role == 'admin'
    return o


def test_create_update():
    client = TestClient(app)
    profile_test_info = create_and_auth(client)
    headers = profile_test_info.authorization_header()
    o = create_org(client, profile_test_info)
    org_id = o.org.id

    r = client.post(f"{api_base}orgs/{org_id}",
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
    r = client.post(f"{api_base}orgs/{org_id}/refs/{admin_profile_test_info.profile.id}/dev", headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    refs = r.json()
    assert len(refs) == 2
    for ref in refs:
        o = munchify(ref)
        assert o.org_id == org_id
        assert o.profile_id == admin_profile_test_info.profile.id
        assert o.role in {'admin', 'dev'}

    # add two user roles
    r = client.post(f"{api_base}orgs/{org_id}/refs/{user_profile_test_info.profile.id}/user", headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    refs = r.json()
    assert len(refs) == 3

    r = client.post(f"{api_base}orgs/{org_id}/refs/{user_profile_test_info.profile.id}/mod", headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    refs = r.json()
    assert len(refs) == 4

    for ref in refs:
        o = munchify(ref)
        assert o.org_id == org_id
        assert o.created_by == admin_id

        if o.profile_id == user_profile_test_info.profile.id:
            assert o.role in {'user', 'mod'}

    # delete a ref
    r = client.delete(f'{api_base}orgs/{org_id}/refs/{user_profile_test_info.profile.id}/mod', headers=headers)
    assert r.status_code == HTTPStatus.OK
    assert len(r.json()) == 3
