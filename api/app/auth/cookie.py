import base64
from uuid import UUID

from db.schema.profiles import Profile

_VERSION: int = 1


def profile_to_cookie(profile: Profile) -> bytes:
    """Encode basic profile data into a b64 encoded cookie string"""
    profile_email_validate_token = str(profile.email_validate_state)
    profile_email_token = profile.email or ''
    profile_location_token = profile.location or ''

    cookie_str = ':'.join([
        str(_VERSION),
        str(profile.profile_id),
        profile_email_token,
        profile_email_validate_token,
        profile_location_token])
    return base64.b64encode(cookie_str.encode('utf-8'))


def cookie_to_profile(cookie: str) -> Profile:
    """Decode b64 encoded cookie string into a profile object"""
    cookie_str = base64.b64decode(cookie).decode("utf-8")
    version, profile_id, email, email_validate, location = cookie_str.split(':')
    if int(version) != _VERSION:
        raise ValueError(f"Invalid cookie version: {version}")
    return Profile(profile_id=UUID(profile_id), email=email, email_validate_state=email_validate, location=location)
