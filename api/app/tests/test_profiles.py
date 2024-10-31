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
