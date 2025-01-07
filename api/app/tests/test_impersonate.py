"""
Test APIs that support impersonation
"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import uploader
from tests.shared_test import assert_status_code, make_random_content, random_str
from munch import munchify

# files / store
# files / get by content hash
# assets / create version

def test_impersonate(api_base, client, create_profile, uploader):
    """
    Profile impersonation is enabled by providing a privileged profile with validated email and
    the Impersonate-Profile-Id header to the key based session API.
    """
    test_profile = create_profile()
    admin_profile = create_profile(
        email='test@mythica.ai',
        validate_email=True,
        impersonate_profile_id=test_profile.profile.profile_id)

    # this auth header should represent the test_profile and not the admin_profile
    auth_headers = admin_profile.authorization_header()

    # upload files as impersonated test account from admin account
    hdas = [make_random_content("hda") for _ in range(2)]
    response_files = uploader(test_profile.profile.profile_id, auth_headers, hdas)
    assert len(response_files) > 0
    for _, file_obj in response_files.items():
        assert file_obj.owner_id == test_profile.profile.profile_id

    # create asset as impersonated user, validate ownership
    r = client.post(f"{api_base}/assets", headers=auth_headers, json={})
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o.owner_id == test_profile.profile.profile_id

    # create version as impersonated user, validate ownership
    r = client.post(f"{api_base}/assets/{o.asset_id}/versions/1.0.0",
                    headers=auth_headers,
                    json={})
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o.owner_id == test_profile.profile.profile_id
    assert o.author_id == test_profile.profile.profile_id
    asset_id = o.asset_id

    # create a random test tag
    r = client.post(f"{api_base}/tags",
                    headers=auth_headers,
                    json={
                        'name': 'tag-impersonate-' + random_str(8, False)
                    })
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    tag_id = o.tag_id

    # tag asset (requires ownership)
    r = client.post(f"{api_base}/tags/types/asset",
                    headers=auth_headers,
                    json={
                        'type_id': asset_id,
                        'tag_id': tag_id
                    })
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o is not None


