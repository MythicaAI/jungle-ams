"""Shared test routines to be used across test modules"""

import hashlib
import json
import logging
import secrets
import string
from uuid import UUID

from pydantic import BaseModel

from db.schema.profiles import Profile, ProfileSession

log = logging.getLogger(__name__)


class FileContentTestObj(BaseModel):
    file_name: str
    file_id: UUID
    contents: bytes
    content_hash: str
    content_type: str
    size: int


class ProfileTestObj(BaseModel):
    auth_token: str
    profile: Profile
    session: ProfileSession

    def authorization_header(self):
        return {"Authorization": f"Bearer {self.auth_token}"}


def get_random_string(length, digits=False):
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
    """Create a random (unresolved TestFileContent object)"""
    file_name = ''.join([secrets.choice(string.ascii_letters) for _ in range(10)])
    test_content = secrets.token_bytes(16)
    return FileContentTestObj(
        file_name=file_name + '.' + file_ext,
        file_id=UUID(int=0),
        contents=test_content,
        content_hash=hashlib.sha1(test_content).hexdigest(),
        content_type=f"application/{file_ext}",
        size=len(test_content))
