from http import HTTPStatus

import pytest
from munch import munchify

from profiles.responses import ProfileResponse
from tests.shared_test import ProfileTestObj, assert_status_code


@pytest.fixture
def create_profile(client, api_base: str, email="test@test.com"):
    """factory fixture, returns profile creation function"""

    async def _create_profile(
            name: str = "test-profile",
            email: str = email,
            full_name: str = "Test Profile",
            signature: str = 32 * 'X',
            description: str = "Test description",
            profile_href: str = "https://nothing.com/",
            validate_email: bool = False,
            impersonate_profile_id: str = None
    ) -> ProfileTestObj:
        r = client.post(f"{api_base}/profiles/",
                        json={
                            'name': name,
                            'email': email,
                            'full_name': full_name,
                            'signature': signature,
                            'description': description,
                            'profile_base_href': profile_href, })
        assert_status_code(r, HTTPStatus.CREATED)
        profile = ProfileResponse(**r.json())
        assert profile.name == name
        assert profile.description == description
        assert profile.signature == signature
        assert profile.profile_base_href == profile_href
        profile_id = profile.profile_id

        # validate existence
        r = client.get(f"{api_base}/profiles/{profile_id}")
        assert_status_code(r, HTTPStatus.OK)
        profile = ProfileResponse(**r.json())
        assert profile.name == name
        assert profile.profile_id == profile_id

        # use the test route to start the session
        r = client.get(f"{api_base}/test/start_session/{profile_id}")
        assert_status_code(r, HTTPStatus.OK)
        auth_token = r.json()['token']

        # start the default session
        test_profile = ProfileTestObj(
            profile=profile,
            auth_token=auth_token
        )

        # optionally validate the email
        if validate_email:
            # validate email to add role tag-author
            headers = test_profile.authorization_header()
            o = munchify(client.get(
                f"{api_base}/validate-email/",
                headers=headers).json())
            assert o.owner_id == profile.profile_id
            assert len(o.link) > 0
            assert len(o.code) > 0
            assert o.state == 'link_sent'
            validate_code = o.code

            o = munchify(client.get(
                f"{api_base}/validate-email/{validate_code}",
                headers=headers).json())
            assert o.owner_id == profile.profile_id
            assert o.state == 'validated'

            # re-start the profile session with the newly validated email
            if impersonate_profile_id:
                url = f"{api_base}/test/start_session/{profile_id}?as_profile_id={impersonate_profile_id}"
            else:
                url = f"{api_base}/test/start_session/{profile_id}"
            r = client.get(url)
            assert_status_code(r, HTTPStatus.OK)
            test_profile.auth_token = r.json()['token']

        return test_profile

    return _create_profile
