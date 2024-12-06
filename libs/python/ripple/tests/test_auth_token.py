from datetime import datetime, timezone

from cryptid.cryptid import profile_seq_to_id
from ripple.auth import roles
from ripple.auth.generate_token import decode_token, generate_token

TEST_EMAIL = 'test@test.com'

profile_seq = 5
profile_id = profile_seq_to_id(profile_seq)
not_sent = 0
sent = 1
location = 'localhost'
environment = 'test'
auth_roles = []


def test_auth_token_with_roles():
    auth_roles = [roles.tag_create, roles.org_create]
    token = generate_token(
        profile_id,
        TEST_EMAIL,
        sent,
        location,
        environment,
        auth_roles)
    assert token is not None
    decode_profile = decode_token(token)
    assert TEST_EMAIL == decode_profile.email
    assert profile_seq == decode_profile.profile_seq
    assert location == decode_profile.location
    assert decode_profile.email_validate_state == sent
    assert roles.tag_create in decode_profile.auth_roles
    assert roles.org_create in decode_profile.auth_roles
    assert '' not in decode_profile.auth_roles
