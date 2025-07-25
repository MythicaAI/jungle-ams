import pytest
from gcid.gcid import profile_seq_to_id
from fastapi import HTTPException
from meshwork.auth.generate_token import generate_token

from auth.data import decode_session_profile

TEST_EMAIL = 'test@test.com'

profile_seq = 5
profile_id = profile_seq_to_id(profile_seq)
not_sent = 0
sent = 1
location = 'localhost'
environment = 'test'
roles = []


def test_auth_token():
    token = generate_token(
        profile_seq_to_id(profile_seq),
        TEST_EMAIL,
        not_sent,
        location,
        environment,
        roles,
    )
    assert token is not None

    profile = decode_session_profile(f"Bearer {token}")
    assert profile.email == TEST_EMAIL
    assert profile.email_validate_state == not_sent
    assert profile.profile_seq == profile_seq
    assert profile.environment == environment


def test_auth_token_decode_error():
    invalid_token = (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
        "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6I"
        "kpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"
        ".SflaKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
    with pytest.raises(HTTPException):
        _ = decode_session_profile(f"{invalid_token}")

    with pytest.raises(HTTPException):
        _ = decode_session_profile(f"Boop {invalid_token}")

    with pytest.raises(HTTPException):
        _ = decode_session_profile(f"Bearer {invalid_token}")
