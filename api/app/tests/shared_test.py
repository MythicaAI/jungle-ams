"""Shared test routines to be used across test modules"""

from datetime import datetime, timedelta, timezone
import hashlib
import json
import logging
import secrets
import string
from http import HTTPStatus
import jwt

from pydantic import BaseModel

from munch import munchify

from auth.generate_token import _AUDIENCE, _SECRET
from main import app
from routes.sessions.sessions import get_auth_validator
from profiles.auth0_validator import Auth0ValidatorFake
from profiles.responses import ProfileResponse

log = logging.getLogger(__name__)


class FileContentTestObj(BaseModel):
    file_name: str
    file_id: str
    contents: bytes
    content_hash: str
    content_type: str
    size: int


class ProfileTestObj(BaseModel):
    auth_token: str
    profile: ProfileResponse

    def authorization_header(self):
        """Return the bearer auth header for the cached token"""
        return {"Authorization": f"Bearer {self.auth_token}"}


def random_str(length: int, digits: bool = False) -> str:
    """Get a random ascii string optionally with digits"""
    characters = string.ascii_letters
    if digits:
        characters += string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def assert_status_code(response, expected_status_code):
    """Validate the response expected status code and extract error detail if it doesn't match"""
    if response.status_code == expected_status_code:
        return
    obj = response.json()
    if type(obj) is dict:
        detail = response.json().get('detail') or 'no error found'
        message = f"details: {json.dumps(detail)}"
    else:
        message = f"obj: {json.dumps(obj)}"
    log.error(message)
    assert response.status_code == expected_status_code, message


def make_random_content(file_ext: str) -> FileContentTestObj:
    """Create a random (unresolved FileContentTestObj object)"""
    file_name = 'file-name' + random_str(10)
    test_content = secrets.token_bytes(16)
    return FileContentTestObj(
        file_name=file_name + '.' + file_ext,
        file_id='',
        contents=test_content,
        content_hash=hashlib.sha1(test_content).hexdigest(),
        content_type=f"application/{file_ext}",
        size=len(test_content),
    )


async def get_fake_auth_validator() -> Auth0ValidatorFake:
    return Auth0ValidatorFake()


def refresh_auth_token(client, api_base, test_profile: ProfileTestObj) -> str:
    """Refresh the auth token after modifying the organization privileges"""
    app.dependency_overrides[get_auth_validator] = get_fake_auth_validator

    token = test_profile.auth_token

    decoded_jwt = jwt.decode(
        jwt=token, key=_SECRET, audience=_AUDIENCE, algorithms=['HS256']
    )

    sub = decoded_jwt["location"]

    def generate_token(payload):
        encoded_jwt = jwt.encode(payload=payload, key=_SECRET,  algorithm='HS256', )
        return encoded_jwt

    now = datetime.now(timezone.utc)
    token = generate_token(
        {
            "iss": "https://dev-dtvqj0iuc5rnb6x2.us.auth0.com/",
            "sub": sub,
            "email": decoded_jwt["email"],
            "email_verified": True,
            "aud": [
                "http://localhost:5555/v1",
                _AUDIENCE,
                "https://dev-dtvqj0iuc5rnb6x2.us.auth0.com/userinfo",
            ],
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(hours=10)).timestamp()),
            "scope": "openid profile email",
            "azp": "4CZhQWoNm1WH8l8042LeF38qHrUTR2ax",
        }
    )

    test_data = {'access_token': token, 'user_id': sub}
    r = client.post(f'{api_base}/sessions/auth0-spa', json=test_data)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert 'token' in o
    assert len(o.token) > 8
    assert o.profile.email == decoded_jwt["email"]
    return o.token
