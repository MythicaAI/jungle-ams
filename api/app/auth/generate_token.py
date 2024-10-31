from config import app_config

_SECRET: bytes = app_config().token_secret_key.encode('utf-8')
_AUDIENCE = "mythica_auth_token"

import jwt

from cryptid.cryptid import profile_id_to_seq, profile_seq_to_id
from db.schema.profiles import OrgRef, Profile


def generate_token(profile: Profile, org_refs: list[OrgRef] = None) -> str:
    """Generate a token from a profile and optional list of roles on the profile."""
    payload = {
        'profile_id': profile_seq_to_id(profile.profile_seq),
        'email': profile.email or '',
        'email_vs': profile.email_validate_state,
        'location': profile.location or '',
        'roles': [ref.role for ref in org_refs or []],
        'aud': _AUDIENCE,
    }
    encoded_jwt = jwt.encode(
        payload=payload,
        key=_SECRET,
        algorithm='HS256')
    return encoded_jwt


def decode_token(encoded_jwt: str) -> (Profile, list[str]):
    """Decode a JWT token string into the profile and role data"""
    decoded_jwt = jwt.decode(
        jwt=encoded_jwt,
        key=_SECRET,
        audience=_AUDIENCE,
        algorithms=['HS256'])
    return Profile(
        profile_seq=profile_id_to_seq(decoded_jwt['profile_id']),
        email=decoded_jwt['email'],
        email_validate_state=int(decoded_jwt['email_vs']),
        location=decoded_jwt['location'], ), decoded_jwt['roles']
