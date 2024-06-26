from db.schema.profiles import Profile
from auth.generate_token import generate_token, DIGEST_SIZE
from auth.data import get_profile
from uuid import uuid4

TEST_EMAIL = 'test@test.com'


def test_auth_token():
    profile_id = uuid4()
    not_sent = "0"
    profile = Profile(id=profile_id, email=TEST_EMAIL,
                      email_validate_state=not_sent, location='localhost')
    token = generate_token(profile)
    assert token is not None
    assert len(token.split(':')[1]) == DIGEST_SIZE*2  # for hex encoding

    profile = get_profile(f"Bearer {token}")
    assert profile.email == TEST_EMAIL
    assert profile.email_validate_state == not_sent
    assert profile.id == profile_id
