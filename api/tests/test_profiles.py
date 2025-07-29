"""Tests to focus on specific functionality of the profiles API"""

# pylint: disable=redefined-outer-name, unused-import

from datetime import datetime, timedelta, timezone
from http import HTTPStatus

import pytest
from fastapi.testclient import TestClient
from munch import munchify

from meshwork.auth import roles
from tests.fixtures.create_org import create_org
from tests.fixtures.create_profile import create_profile
from tests.script_tests.profile_factory import get_email_validation_key, set_email_validation_expires
from tests.shared_test import ProfileTestObj, assert_status_code, refresh_auth_token
from validate_email.responses import ValidateEmailResponse, ValidateEmailState

test_profile_name = "test-profile"
test_profile_description = "test-description"
test_profile_signature = 32 * 'X'
test_profile_href = "https://test.com/"
test_profile_full_name = "test-profile-full-name"
test_profile_email = "test@test.com"


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
    user_profile: ProfileTestObj = await create_profile(email="test@somewhere.com")
    mythica_profile: ProfileTestObj = await create_profile(email="test@mythica.ai")

    # validate email to add the mythica roles, this also currently creates
    # a mythica org if one does not currently exist
    o = munchify(client.get(
        f"{api_base}/validate-email/",
        headers=mythica_profile.authorization_header()).json())
    assert o.owner_id == mythica_profile.profile.profile_id
    key = get_email_validation_key(api_base, client, mythica_profile.profile.profile_id)
    o = munchify(client.get(
        f"{api_base}/validate-email/{key}",
        headers=mythica_profile.authorization_header()).json())
    assert o.owner_id == mythica_profile.profile.profile_id
    assert o.state == 'validated'

    # get the token with the refreshed roles
    mythica_profile.auth_token = refresh_auth_token(client, mythica_profile)

    create_org(user_profile)

    # get user token with refreshed org roles
    user_profile.auth_token = refresh_auth_token(client, user_profile)

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


@pytest.mark.asyncio
async def test_email_validation(api_base, client: TestClient, create_profile):
    test_profile: ProfileTestObj = await create_profile(name=test_profile_name,
                                                        email=test_profile_email,
                                                        full_name=test_profile_full_name,
                                                        signature=test_profile_signature,
                                                        description=test_profile_description,
                                                        profile_href=test_profile_href)
    profile_id = test_profile.profile.profile_id
    assert profile_id is not None
    headers = test_profile.authorization_header()

    # validate email
    validate_res = ValidateEmailResponse(
        **client.get(f"{api_base}/validate-email", headers=headers).json()
    )
    assert validate_res.owner_id == profile_id
    assert validate_res.state == ValidateEmailState.link_sent

    # Test link is expired
    key = get_email_validation_key(api_base, client, profile_id)

    set_email_validation_expires(
        api_base, client, key, datetime.now(timezone.utc) - timedelta(minutes=60))

    expired_res = client.get(
        f"{api_base}/validate-email/{key}", headers=headers
    )
    assert_status_code(expired_res, HTTPStatus.GONE)

    # Move the expiration time on the key
    set_email_validation_expires(
        api_base, client, key, datetime.now(timezone.utc) + timedelta(minutes=60))

    validate_res = ValidateEmailResponse(**client.get(f"{api_base}/validate-email/{key}", headers=headers).json())
    assert validate_res.owner_id == profile_id
    assert validate_res.state == ValidateEmailState.validated

    # start the default session
    test_profile = ProfileTestObj(
        profile=test_profile.profile,
        auth_token=refresh_auth_token(client, test_profile))
    headers = test_profile.authorization_header()

    # Test validate email if it has been already validated
    validate_res = ValidateEmailResponse(
        **client.get(f"{api_base}/validate-email", headers=headers).json()
    )
    assert validate_res.owner_id == profile_id
    assert validate_res.state == ValidateEmailState.validated

    validate_res = ValidateEmailResponse(
        **client.get(
            f"{api_base}/validate-email/{key}", headers=headers
        ).json()
    )
    assert validate_res.owner_id == profile_id
    assert validate_res.state == ValidateEmailState.validated
