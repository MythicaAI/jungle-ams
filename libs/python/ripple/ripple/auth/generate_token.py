"""
Generate a token from profile session data, retrieve the SessionProfile
object from a JWT token
"""
from config import app_config
from ripple.config import ripple_config
from ripple.models.sessions import SessionProfile

_SECRET: bytes = ripple_config().ripple_token_secret_key.encode('utf-8')
_AUDIENCE = "mythica_auth_token"

import jwt

from cryptid.cryptid import profile_id_to_seq
from pydantic import BaseModel


def generate_token(
        profile_id: str,
        profile_email: str,
        profile_email_validate_state: int,
        profile_location: str,
        environment: str,
        roles: list[str] = None,
        impersonated_by: str = None) -> str:
    """Generate a token from a profile and optional list of roles on the profile."""
    payload = {
        'profile_id': profile_id,
        'email': profile_email or '',
        'email_vs': profile_email_validate_state,
        'location': profile_location or '',
        'roles': roles or [],
        'env': environment,
        'aud': _AUDIENCE,
        'mpr': impersonated_by or ''
    }
    encoded_jwt = jwt.encode(
        payload=payload,
        key=_SECRET,
        algorithm='HS256')
    return encoded_jwt


def decode_token(encoded_jwt: str) -> SessionProfile:
    """Decode a JWT token string into the profile and role data"""
    decoded_jwt = jwt.decode(
        jwt=encoded_jwt,
        key=_SECRET,
        audience=_AUDIENCE,
        algorithms=['HS256'])
    profile_id = decoded_jwt['profile_id']
    profile_seq = profile_id_to_seq(profile_id)
    return SessionProfile(
        auth_token=encoded_jwt,
        profile_seq=profile_seq,
        profile_id=profile_id,
        email=decoded_jwt['email'],
        email_validate_state=int(decoded_jwt.get('email_vs', 0)),
        location=decoded_jwt.get('location', 'none'),
        environment=decoded_jwt.get('env', app_config().mythica_environment),
        auth_roles=decoded_jwt['roles'],
        impersonated=False)
