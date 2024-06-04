from http import HTTPStatus

from auth.cookie import cookie_to_profile
from auth.generate_token import validate_token
from db.schema.profiles import Profile


# TODO: middleware to capture internal errors
class AuthError(Exception):
    def __init__(self, message, status_code=HTTPStatus.BAD_REQUEST):
        self.message = message
        self.status_code = status_code


def get_profile(authorization: str) -> Profile:
    """Given an auth bearer header value, return a Profile object"""
    if authorization is None:
        raise AuthError('Authorization header missing')

    auth_parts = authorization.split(' ')
    if not authorization.startswith('Bearer '):
        raise AuthError('Invalid Authorization header')

    if len(auth_parts) != 2:
        raise AuthError('Bad Authorization header')

    if not validate_token(auth_parts[1]):
        raise AuthError('Invalid token', HTTPStatus.UNAUTHORIZED)

    cookie_data = auth_parts[1].split(':')[0]
    profile = cookie_to_profile(cookie_data)
    return profile
