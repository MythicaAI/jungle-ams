"""Tests to focus on specific functionality of the profiles API"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

import pytest
from munch import munchify

from ripple.auth import roles
from tests.fixtures.create_org import create_org
from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code, refresh_auth_token


@pytest.mark.asyncio
async def test_public_profile(api_base, client, create_profile):
    test_profile = await create_profile(validate_email=True)

    # authenticated
    r = client.get(
        f"{api_base}/profiles/{test_profile.profile.profile_id}",
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.OK)
    assert 'email' in r.json()

    # non-authenticated
    r = client.get(
        f"{api_base}/profiles/{test_profile.profile.profile_id}")
    assert_status_code(r, HTTPStatus.OK)
    assert 'email' not in r.json()


@pytest.mark.asyncio
async def test_profile_update_no_values(api_base, client, create_profile):
    test_profile = await create_profile()
    profile_update_payload = {}
    r = client.post(
        f"{api_base}/profiles/{test_profile.profile.profile_id}",
        json=profile_update_payload,
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.OK)
    assert 'name' in r.json()
    assert r.json()['name'] == test_profile.profile.name


@pytest.mark.asyncio
async def test_profile_update_admin(api_base, client, create_profile):
    test_profile = await create_profile(validate_email=True)
    test_profile_super = await create_profile(
        email="jacob@mythica.ai",
        validate_email=True)

    # use the superuser to redact a description
    profile_update_payload = {
        'description': "redacted"
    }
    r = client.post(
        f"{api_base}/profiles/{test_profile.profile.profile_id}",
        json=profile_update_payload,
        headers=test_profile_super.authorization_header())
    assert_status_code(r, HTTPStatus.OK)
    assert 'description' in r.json()
    assert r.json()['description'] == 'redacted'

    # ensure that the privilege only goes one way
    r = client.post(
        f"{api_base}/profiles/{test_profile_super.profile.profile_id}",
        json=profile_update_payload,
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.UNAUTHORIZED)


@pytest.mark.asyncio
async def test_privilege_access(client, api_base, create_profile, create_org):
    user_profile = await create_profile(email="test@somewhere.com")
    mythica_profile = await create_profile(email="test@mythica.ai")

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

    # get the token with the refreshed roles
    mythica_profile.auth_token = await refresh_auth_token(mythica_profile)

    create_org(user_profile)

    # get user token with refreshed org roles
    user_profile.auth_token = await refresh_auth_token(user_profile)

    # Ensure that the user profile
    #   does not get tag create
    #   has org-admin on org structure
    # .  has org-admin:<ID> as auth role
    o = munchify(client.get(f"{api_base}/profiles/roles/",
                            headers=user_profile.authorization_header()).json())
    assert roles.alias_tag_author not in o.auth_roles
    assert any([roles.alias_org_admin in r.roles for r in o.org_roles])
    for role in o.org_roles:
        assert f'org-admin:{role.org_id}' in o.auth_roles

    # Ensure that mythica profile has tag_create role
    o = munchify(client.get(f"{api_base}/profiles/roles/",
                            headers=mythica_profile.authorization_header()).json())
    assert roles.alias_tag_author in o.auth_roles
