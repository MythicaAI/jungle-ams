from http import HTTPStatus
from http.client import HTTPException

from fastapi import Header
from auth.data import get_profile
from db.schema.profiles import Profile
import auth.roles as roles

async def current_profile(authorization: str = Header("Authorization")) -> Profile:
    return get_profile(authorization)
