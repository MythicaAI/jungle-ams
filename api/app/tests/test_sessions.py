"""
Test the session creation from different contexts including negative cases
"""

# pylint: disable=redefined-outer-name, unused-import

from datetime import datetime, timedelta, timezone
from http import HTTPStatus
import random

import jwt
from munch import munchify

from auth.generate_token import _AUDIENCE, _SECRET
from main import app
from profiles.auth0_validator import Auth0ValidatorFake
from routes.sessions.sessions import get_auth_validator
from tests.conftest import api_base
from tests.fixtures.create_profile import create_profile
from tests.shared_test import ProfileTestObj, assert_status_code


test_profile_email = "test@mythica.ai"

def test_start_session_api_key(api_base, client, create_profile):
    test_profile: ProfileTestObj = create_profile()
    auth_headers = test_profile.authorization_header()
    req = {
        'name': 'test-dev-key'
    }
    r = client.post(f'{api_base}/keys', json=req, headers=auth_headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert 'value' in o
    api_key = o.value

    r = client.get(f'{api_base}/sessions/key/{api_key}')
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert 'token' in o
    assert 'profile' in o
    assert o.profile.profile_id == test_profile.profile.profile_id


def test_start_session_openid(api_base, client):
    async def get_fake_auth_validator() -> Auth0ValidatorFake:
        return Auth0ValidatorFake()

    app.dependency_overrides[get_auth_validator] = get_fake_auth_validator
    
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
        "email": test_profile_email,
        "email_verified": True,
        "aud": [
            "http://localhost:5555/v1",
            _AUDIENCE,
            "https://dev-dtvqj0iuc5rnb6x2.us.auth0.com/userinfo"
        ],
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=10)).timestamp()),
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
    assert o.profile.email == test_profile_email


def test_resume_session_openid():
    """Resume the session again using the openID subject"""


def test_merged_open_ids():
    """Given two different open IDs they should both locate the same profile if the
    email address in the given open ID is verified and refers to the same profile"""
