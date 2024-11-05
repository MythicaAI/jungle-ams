from datetime import datetime, timezone

import auth.roles
from auth.data import get_profile
from auth.generate_token import decode_token, generate_token
from cryptid.cryptid import profile_seq_to_id
from db.schema.profiles import OrgRef

TEST_EMAIL = 'test@test.com'

profile_seq = 5
profile_id = profile_seq_to_id(profile_seq)
not_sent = 0
sent = 1
location = 'localhost'
roles = []


def test_auth_token():
    token = generate_token(
        profile_seq_to_id(profile_seq),
        TEST_EMAIL,
        not_sent,
        location,
        roles,
    )
    assert token is not None

    profile = get_profile(f"Bearer {token}")
    assert profile.email == TEST_EMAIL
    assert profile.email_validate_state == not_sent
    assert profile.profile_seq == profile_seq


def test_auth_token_with_roles():
    org_roles = [
        OrgRef(
            org_seq=2,
            profile_seq=profile_seq,
            author_seq=1,
            role=auth.roles.tag_create,
            created=datetime.now(timezone.utc)),
        OrgRef(
            org_seq=3,
            profile_seq=profile_seq,
            author_seq=1,
            role=auth.roles.org_create,
            created=datetime.now(timezone.utc))]
    token = generate_token(
        profile_id,
        TEST_EMAIL,
        sent,
        location,
        [r.role for r in org_roles])
    assert token is not None
    decode_profile, decode_roles = decode_token(token)
    assert TEST_EMAIL == decode_profile.email
    assert profile_seq == decode_profile.profile_seq
    assert location == decode_profile.location
    assert decode_profile.email_validate_state == sent
    assert auth.roles.tag_create in decode_roles
    assert auth.roles.org_create in decode_roles
    assert '' not in roles
