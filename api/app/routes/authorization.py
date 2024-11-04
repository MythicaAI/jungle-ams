from typing import Annotated, Optional, Union

from http import HTTPStatus
from fastapi import HTTPException, Header, Request, WebSocket

from auth.data import get_profile
from db.schema.profiles import Profile
from cryptid.cryptid import profile_seq_to_id

async def current_profile(authorization: Annotated[str | None, Header()]) -> Profile:
    """Dependency that provides the profile record for the current authorization header"""
    return get_profile(authorization)


async def current_cookie_profile(request: Union[WebSocket, Request]) -> Profile:
    """Retrieve the profile based on a token stored in cookies"""
    token = request.cookies.get("Authorization")
    if not token:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="Not authenticated")
    return get_profile(token)


async def get_optional_profile(
    authorization: Optional[str] = Header(None)
) -> Optional[Profile]:
    if authorization is None:
        return None
    try:
        return await current_profile(authorization)
    except HTTPException as e:
        if e.status_code == HTTPStatus.FORBIDDEN:
            return None
        raise


async def current_profile_id(authorization: Annotated[str | None, Header()]) -> str:
    """Dependency that provides the profile UUID for the current authorization header"""
    profile = get_profile(authorization)
    if profile is None:
        return ''
    return profile_seq_to_id(profile.profile_seq)
