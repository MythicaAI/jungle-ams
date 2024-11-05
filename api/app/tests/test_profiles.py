"""Tests to focus on specific functionality of the profiles API"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code


def test_public_profile(api_base, client, create_profile):
    test_profile = create_profile(validate_email=True)

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


def test_profile_update_no_values(api_base, client, create_profile):
    test_profile = create_profile()
    profile_update_payload = {}
    r = client.post(
        f"{api_base}/profiles/{test_profile.profile.profile_id}",
        json=profile_update_payload,
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.OK)
    assert 'name' in r.json()
    assert r.json()['name'] == test_profile.profile.name


def test_profile_update_admin(api_base, client, create_profile):
    test_profile = create_profile(validate_email=True)
    test_profile_super = create_profile(
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
