"""Organization test cases"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

from munch import munchify

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

    r = client.post(f"{api_base}/orgs/{org_id}",
                    json={'name': 'test-updated', 'description': 'test-desc', },
                    headers=headers)
    assert r.status_code == HTTPStatus.OK
    o = munchify(r.json())
    assert o.name == 'test-updated'
    assert o.description == 'test-desc'
    assert o.org_id == org_id


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

    # create a new role for the admin
    r = client.post(
        f"{api_base}/orgs/{org_id}/roles/{admin_profile_test_info.profile.profile_id}/dev",
        headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 2
    for ref in roles:
        o = munchify(ref)
        assert o.org_id == org_id
        assert o.profile_id == admin_profile_test_info.profile.profile_id
        assert o.role in {'admin', 'dev'}

    # add two user roles
    r = client.post(
        f"{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.profile_id}/user",
        headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 3

    r = client.post(
        f"{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.profile_id}/mod",
        headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    roles = r.json()
    assert len(roles) == 4

    for role in roles:
        o = munchify(role)
        assert o.org_id == org_id
        assert o.author_id == admin_id

        if o.profile_id == user_profile_test_info.profile.profile_id:
            assert o.role in {'user', 'mod'}

    # delete a ref
    r = client.delete(
        f'{api_base}/orgs/{org_id}/roles/{user_profile_test_info.profile.profile_id}/mod',
        headers=headers)
    assert r.status_code == HTTPStatus.OK
    assert len(r.json()) == 3

    # create the user role in org2
    r = client.post(f"{api_base}/orgs/{org_id2}/roles/{user_profile_test_info.profile.profile_id}/user",
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
        assert o.role == 'user'
        assert o.org_id in {org_id, org_id2}
        orgs.append(o.org_id)
    assert org_id in orgs
    assert org_id2 in orgs


def test_privilege_access(client, api_base, create_profile, create_org):
    user_profile = create_profile(email="test@somewhere.com")
    mythica_profile = create_profile(email="test@mythica.ai")

    # validate email to add the mythica roles, this also currently creates
    # a mythica org if one does not currently exist
    o = munchify(client.get(
        f"{api_base}/validate-email/",
        headers=mythica_profile.authorization_header()).json())
    assert o.owner_id == mythica_profile.profile.profile_id
    o = munchify(client.get(
        f"{api_base}/validate-email/{o.code}",
        headers=mythica_profile.authorization_header()).json())
    assert o.owner_id == mythica_profile.profile.profile_id
    assert o.state == 'validated'

    create_org(user_profile)

    # Ensure that the user profile does not get tag create but has admin from creating
    # new org
    o = munchify(client.get(f"{api_base}/profiles/{user_profile.profile.profile_id}/roles",
                            headers=user_profile.authorization_header()).json())
    assert not any(["mythica-tags" in roles.roles for roles in o.org_roles])
    assert any(["org-admin" in roles.roles for roles in o.org_roles])

    # Ensure that mythica profile has tag_create
    # there will be role mythica-tags because test_profile_email = "test@mythica.ai"
    o = munchify(client.get(f"{api_base}/profiles/{mythica_profile.profile.profile_id}/roles",
                            headers=mythica_profile.authorization_header()).json())
    assert any(["tag-editor" in roles.roles for roles in o.org_roles])
