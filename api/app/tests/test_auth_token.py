from datetime import datetime, timezone

import auth.roles
from auth.data import get_profile
from auth.generate_token import decode_token, generate_token
from db.schema.profiles import OrgRef, Profile

TEST_EMAIL = 'test@test.com'


def test_auth_token():
    profile_seq = 5
    not_sent = 0
    profile = Profile(profile_seq=profile_seq, email=TEST_EMAIL,
                      email_validate_state=not_sent, location='localhost')
    token = generate_token(profile)
    assert token is not None

    profile = get_profile(f"Bearer {token}")
    assert profile.email == TEST_EMAIL
    assert profile.email_validate_state == not_sent
    assert profile.profile_seq == profile_seq


def test_auth_token_with_roles():
    profile_seq = 5
    sent = 1
    profile = Profile(profile_seq=profile_seq, email=TEST_EMAIL,
                      email_validate_state=sent, location='localhost')
    roles = [
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
    token = generate_token(profile, roles)
    assert token is not None
    decode_profile, decode_roles = decode_token(token)
    assert profile.email == decode_profile.email
    assert profile.profile_seq == decode_profile.profile_seq
    assert profile.location == decode_profile.location
    assert decode_profile.email_validate_state == sent
    assert auth.roles.tag_create in decode_roles
    assert auth.roles.org_create in decode_roles
    assert '' not in roles
