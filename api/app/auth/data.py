from http import HTTPStatus

from auth.cookie import cookie_to_profile
from auth.generate_token import validate_token
from db.schema.profiles import Profile
from fastapi import HTTPException


def get_profile(authorization: str) -> Profile:
    """Given an auth bearer header value, return a Profile object"""
    if not authorization:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail='Authorization header missing')

    auth_parts = authorization.split(' ')
    if len(auth_parts) != 2 or not auth_parts[0] == 'Bearer':
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail='Invalid Authorization header')

    if not validate_token(auth_parts[1]):
        raise HTTPException(HTTPStatus.UNAUTHORIZED, detail='Invalid token')

    cookie_data = auth_parts[1].split(':')[0]
    profile = cookie_to_profile(cookie_data)
    return profile
