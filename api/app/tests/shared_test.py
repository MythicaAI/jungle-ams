"""Shared test routines to be used across test modules"""

import hashlib
import json
import logging
import secrets
import string

from pydantic import BaseModel

from cryptid.cryptid import profile_id_to_seq
from db.connection import db_session_pool
from profiles.responses import ProfileResponse
from profiles.start_session import start_session

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
        size=len(test_content))


async def refresh_auth_token(test_profile):
    """Refresh the auth token after modifying the organization privileges"""
    profile_id = test_profile.profile.profile_id
    async with db_session_pool() as db_session:
        session_response = await start_session(
            db_session,
            profile_seq=profile_id_to_seq(profile_id),
            location="test-case",
            impersonate_profile_id=None)
        assert session_response.profile.profile_id == profile_id
        assert len(session_response.token) > 0
        auth_token = session_response.token
        return auth_token
