import httpx
from http import HTTPStatus

from profiles.responses import ProfileResponse, SessionStartResponse
from tests.shared_test import ProfileTestObj, assert_status_code


async def create_profile_and_start_session(
    api_base: str,
    timeout: int,
    name: str = "test-profile",
    email: str = "test@test.com",
    full_name: str = "Test Profile",
    signature: str = 32 * 'X',
    description: str = "Test description",
    profile_href: str = "https://nothing.com/",
) -> ProfileTestObj:
    """
    Factory method to create a profile, validate existence, start a session,
    and return the profile object with auth token.
    """

    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{api_base}/profiles",
            json={
                'name': name,
                'email': email,
                'full_name': full_name,
                'signature': signature,
                'description': description,
                'profile_base_href': profile_href,
            },
            follow_redirects=True,
            timeout=timeout,
        )
        profile = ProfileResponse(**r.json())
        assert profile.name == name
        assert profile.description == description
        assert profile.signature == signature
        assert profile.profile_base_href == profile_href
        profile_id = profile.profile_id

        r = await client.get(
            f"{api_base}/profiles/{profile_id}",
            timeout=timeout,
        )
        assert_status_code(r, HTTPStatus.OK)
        profile = ProfileResponse(**r.json())
        assert profile.name == name
        assert profile.profile_id == profile_id

        r = await client.get(
            f"{api_base}/sessions/direct/{profile_id}",
            timeout=timeout,
        )
        assert_status_code(r, HTTPStatus.OK)
        session_response = SessionStartResponse(**r.json())
        assert session_response.profile.profile_id == profile_id
        assert len(session_response.token) > 0
        auth_token = session_response.token

        return ProfileTestObj(profile=profile, auth_token=auth_token)
