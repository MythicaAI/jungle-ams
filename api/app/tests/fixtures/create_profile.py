from http import HTTPStatus

import pytest
from munch import munchify

from cryptid.cryptid import profile_id_to_seq
from db.connection import get_session
from profiles.responses import ProfileResponse
from tests.script_tests.profile_factory import get_verification_email_code
from tests.shared_test import ProfileTestObj, assert_status_code
from profiles.start_session import start_session

@pytest.fixture
def create_profile(client, api_base: str, mock_mail_send_success, email="test@test.com"):
    """factory fixture, returns profile creation function"""

    def _create_profile(
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

        def start_test_session(session_profile_id: str, as_profile_id=None) -> str:
            with get_session() as db_session:
                session_start_response = start_session(
                    db_session,
                    profile_id_to_seq(session_profile_id),
                    location='test-case',
                    impersonate_profile_id=as_profile_id)
                auth_token = session_start_response.token
                return auth_token

        # start the default session
        test_profile = ProfileTestObj(
            profile=profile,
            auth_token=start_test_session(profile.profile_id),
        )

        # optionally validate the email
        if validate_email:
            # validate email to add role tag-author
            headers = test_profile.authorization_header()
            o = munchify(client.get(
                f"{api_base}/validate-email/",
                headers=headers).json())
            assert o.owner_id == profile.profile_id
            assert o.state == 'link_sent'
            validate_code = get_verification_email_code(profile.profile_id)

            o = munchify(client.get(
                f"{api_base}/validate-email/{validate_code}",
                headers=headers).json())
            assert o.owner_id == profile.profile_id
            assert o.state == 'validated'

            # re-start the profile session with the newly validated email
            test_profile.auth_token = start_test_session(profile.profile_id, impersonate_profile_id)

        return test_profile

    return _create_profile
