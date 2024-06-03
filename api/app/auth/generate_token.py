import hashlib
import os

from auth.cookie import profile_to_cookie
from db.schema.profiles import Profile

DIGEST_SIZE: int = 32
_SECRET: bytes = os.environ.get("SECRET_KEY", 'invalid').encode('utf-8')
_PERSON: bytes = "auth_token".encode('utf-8')


def generate_token(profile: Profile) -> str:
    """Generate a token with a cookie and hash digest."""
    h = hashlib.blake2b(digest_size=DIGEST_SIZE, key=_SECRET, person=_PERSON)
    profile_cookie = profile_to_cookie(profile)
    h.update(profile_cookie)
    return f"{profile_cookie}:{h.hexdigest()}"


def validate_token(token: str) -> bool:
    """Validate a token with a cookie and hash digest"""
    cookie, signature = token.split(':')
    h = hashlib.blake2b(digest_size=DIGEST_SIZE, key=_SECRET, person=_PERSON)
    h.update(cookie.encode('utf-8'))
    return signature == h.hexdigest()

