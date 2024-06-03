
from db.schema.profiles import Profile
from auth.generate_token import generate_token, decode_token, DIGEST_SIZE
from uuid import uuid4

TEST_EMAIL = 'test@test.com'
def test_auth_token():
    profile_id = uuid4()
    profile = Profile(id=profile_id, email=TEST_EMAIL, email_verified=False, location='localhost')
    token = generate_token(profile)
    assert token is not None
    assert len(token) == DIGEST_SIZE

    value = decode_token(token)
    assert value.email == TEST_EMAIL
    assert value.email_verified is False
    assert value.id == profile_id