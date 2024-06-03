import base64

from db.schema.profiles import Profile

_VERSION: int = 1


def profile_to_cookie(profile: Profile) -> bytes:
    """Encode basic profile data into a b64 encoded cookie string"""
    cookie_str = f"{_VERSION}:{profile.id}:{profile.email}:{profile.email_verified}:{profile.location}".encode("utf-8")
    return base64.b64encode(cookie_str)


def cookie_to_profile(cookie: bytes) -> Profile:
    """Decode b64 encoded cookie string into a profile object"""
    cookie_str = base64.b64decode(cookie).decode("utf-8")
    version, profile_id, email, email_verified, location = cookie_str.split(':')
    if version != _VERSION:
        raise ValueError(f"Invalid cookie version: {version}")
    return Profile(id=profile_id, email=email, email_verified=email_verified, location=location)
