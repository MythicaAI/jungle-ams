from fastapi import Header
from auth.data import get_profile


async def current_profile(authorization: str = Header("Authorization")):
    return get_profile(authorization)
