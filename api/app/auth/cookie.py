import base64

from db.schema.profiles import Profile

_VERSION: int = 1


def profile_to_cookie(profile: Profile) -> bytes:
    """Encode basic profile data into a b64 encoded cookie string"""
    profile_email_verified_token = 'Y' if profile.email_verified else 'N'
    profile_signature_token = profile.signature or ''
    profile_location_token = profile.location or ''

    cookie_str = ':'.join([
        str(_VERSION),
        str(profile.id),
        profile_signature_token,
        profile_email_verified_token,
        profile_location_token])
    return base64.b64encode(cookie_str.encode('utf-8'))


def cookie_to_profile(cookie: str) -> Profile:
    """Decode b64 encoded cookie string into a profile object"""
    cookie_str = base64.b64decode(cookie).decode("utf-8")
    version, profile_id, signature, email_verified, location = cookie_str.split(':')
    if int(version) != _VERSION:
        raise ValueError(f"Invalid cookie version: {version}")
    return Profile(id=profile_id, signature=signature, email_verified=email_verified, location=location)
