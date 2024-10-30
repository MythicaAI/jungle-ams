from http import HTTPStatus

from munch import munchify
import pytest

from profiles.responses import ProfileResponse, SessionStartResponse
from tests.shared_test import ProfileTestObj, assert_status_code


@pytest.fixture
def create_profile(client, api_base: str, email="test@test.com"):
    """factory fixture, returns profile creation function"""

    def _create_profile(
            name: str = "test-profile",
            email: str = email,
            full_name: str = "Test Profile",
            signature: str = 32 * 'X',
            description: str = "Test description",
            profile_href: str = "https://nothing.com/",
            validate_email=False,
        ) -> ProfileTestObj:
        r = client.post(f"{api_base}/profiles",
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

        # Start session
        r = client.get(f"{api_base}/sessions/direct/{profile_id}")
        assert_status_code(r, HTTPStatus.OK)
        session_response = SessionStartResponse(**r.json())
        assert session_response.profile.profile_id == profile_id
        assert len(session_response.token) > 0
        auth_token = session_response.token\

        test_profile = ProfileTestObj(
            profile=profile,
            auth_token=auth_token,
        )
        if validate_email:
            
            # validate email to add role mythica-tags
            headers = test_profile.authorization_header()
            o = munchify(client.get(
                f"{api_base}/validate-email",
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

        return test_profile

    return _create_profile
