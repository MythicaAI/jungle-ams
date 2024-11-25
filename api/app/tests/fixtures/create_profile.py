from datetime import datetime, timedelta, timezone
from http import HTTPStatus
import random

import jwt
import pytest
from munch import munchify

from auth.generate_token import _AUDIENCE, _SECRET
from main import app
from routes.sessions.sessions import get_auth_validator
from profiles.auth0_validator import Auth0ValidatorFake
from profiles.responses import ProfileResponse
from tests.shared_test import ProfileTestObj, assert_status_code


async def get_fake_auth_validator() -> Auth0ValidatorFake:
    return Auth0ValidatorFake()


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

        app.dependency_overrides[get_auth_validator] = get_fake_auth_validator

        def start_session() -> str:
            def generate_token(payload):
                encoded_jwt = jwt.encode(
                    payload=payload,
                    key=_SECRET,
                    algorithm='HS256')
                return encoded_jwt

            now = datetime.now(timezone.utc)
            user_id = random.randint(1, 99999999)
            sub = 'googleoath|' + str(user_id)
            token = generate_token({
                "iss": "https://dev-dtvqj0iuc5rnb6x2.us.auth0.com/",
                "sub": sub,
                "email": email,
                "email_verified": True,
                "aud": [
                    "http://localhost:5555/v1",
                    _AUDIENCE,
                    "https://dev-dtvqj0iuc5rnb6x2.us.auth0.com/userinfo"
                ],
                "iat": int(now.timestamp()),
                "exp": int((now + timedelta(days=10)).timestamp()),
                "scope": "openid profile email",
                "azp": "4CZhQWoNm1WH8l8042LeF38qHrUTR2ax"
            })

            test_data = {
                'access_token': token,
                'user_id': sub,
            }
            r = client.post(f'{api_base}/sessions/auth0-spa', json=test_data)
            assert_status_code(r, HTTPStatus.OK)
            o = munchify(r.json())
            assert 'token' in o
            assert len(o.token) > 8
            assert o.roles == []
            assert o.profile.email == email
            return o.token

        test_profile = ProfileTestObj(
            profile=profile,
            auth_token=start_session(),
        )

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

            # start a new session with the new token
            test_profile.auth_token = start_session()

        return test_profile

    return _create_profile
