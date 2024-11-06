"""Organization test cases"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

from munch import munchify

import auth.roles
from cryptid.cryptid import org_seq_to_id
from tests.fixtures.create_org import create_org
from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code, refresh_auth_token


def test_create_update(client, api_base, create_profile, create_org):
    test_profile = create_profile()
    o = create_org(test_profile)
    org_id = o.org_id

    # refresh the auth token (with roles) after creating an org
    test_profile.auth_token = refresh_auth_token(client, api_base, test_profile)
    headers = test_profile.authorization_header()

    payload = {'name': 'test-updated',
               'description': 'test-desc',
               }
    r = client.post(f"{api_base}/orgs/{org_id}",
                    json=payload,
                    headers=headers)
    assert r.status_code == HTTPStatus.OK
    o = munchify(r.json())
    assert o.name == 'test-updated'
    assert o.description == 'test-desc'
    assert o.org_id == org_id

    # test with a valid org_id that should not exist
    r = client.post(
        f"{api_base}/orgs/{org_seq_to_id(1000000)}",
        json=payload,
        headers=headers)
    assert_status_code(r, HTTPStatus.NOT_FOUND)


def test_org_ref_operations(client, api_base, create_profile, create_org):
    admin_profile_test_info = create_profile()
    user_profile_test_info = create_profile()
    org = create_org(admin_profile_test_info)
    org2 = create_org(admin_profile_test_info)

    org_id = org.org_id
    org_id2 = org2.org_id
    admin_id = org.profile_id

    # refresh auth
    admin_profile_test_info.auth_token = refresh_auth_token(
        client, api_base, admin_profile_test_info)
    user_profile_test_info.auth_token = refresh_auth_token(
        client, api_base, user_profile_test_info)
    headers = admin_profile_test_info.authorization_header()

    # validate that unknown roles fail
    r = client.post(
        f"{api_base}/orgs/{org_id}/roles/{admin_profile_test_info.profile.profile_id}/foo",
        headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # create a new role for the admin
    r = client.post(
        f"{api_base}/orgs/{org_id}/roles/{admin_profile_test_info.profile.profile_id}/{auth.roles.alias_org_member}",
        headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    roles = r.json()
    assert len(roles) == 2
    for ref in roles:
        o = munchify(ref)
        assert o.org_id == org_id
        assert o.profile_id == admin_profile_test_info.profile.profile_id
        assert o.role in {auth.roles.alias_org_admin, auth.roles.alias_org_member}

    # add two user roles
    r = client.post(
        f"{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.profile_id}/{auth.roles.alias_org_member}",
        headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 3

    r = client.post(
        f"{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.profile_id}/{auth.roles.alias_org_mod}",
        headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 4

    for role in roles:
        o = munchify(role)
        assert o.org_id == org_id
        assert o.author_id == admin_id

        if o.profile_id == user_profile_test_info.profile.profile_id:
            assert o.role in {auth.roles.alias_org_member, auth.roles.alias_org_mod}

    # delete a ref
    r = client.delete(
        f'{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.profile_id}/{auth.roles.alias_org_mod}',
        headers=headers)
    assert r.status_code == HTTPStatus.OK
    assert len(r.json()) == 3

    # create the user role in org2
    r = client.post(
        f"{api_base}/orgs/{org_id2}/roles/{user_profile_test_info.profile.profile_id}/{auth.roles.alias_org_member}",
        headers=headers)
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
        assert o.profile_id == user_profile_test_info.profile.profile_id
        assert o.role == auth.roles.alias_org_member
        assert o.org_id in {org_id, org_id2}
        orgs.append(o.org_id)
    assert org_id in orgs
    assert org_id2 in orgs
