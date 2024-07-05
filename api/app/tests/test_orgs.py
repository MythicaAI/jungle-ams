from http import HTTPStatus

from fastapi.testclient import TestClient
from munch import munchify

from main import app
from .shared_test import assert_status_code


def test_create_update(api_base, create_profile, create_org):
    client = TestClient(app)
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
    assert o.id == org_id


def test_org_ref_operations():
    client = TestClient(app)
    admin_profile_test_info = create_and_auth(client)
    user_profile_test_info = create_and_auth(client)
    headers = admin_profile_test_info.authorization_header()
    o = create_org(client, admin_profile_test_info)
    o2 = create_org(client, admin_profile_test_info)

    org_id = o.org.id
    org_id2 = o2.org.id
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
        assert o.profile_id == user_profile_test_info.profile.id
        assert o.role == 'user'
        assert o.org_id in {org_id, org_id2}
        orgs.append(o.org_id)
    assert org_id in orgs
    assert org_id2 in orgs
