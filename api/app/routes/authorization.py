from http import HTTPStatus
from typing import Annotated, Optional, Union

from fastapi import HTTPException, Header, Request, Security, WebSocket
from fastapi.security.api_key import APIKeyHeader

from auth.data import get_profile, get_profile_roles
from cryptid.cryptid import profile_seq_to_id
from db.schema.profiles import Profile

api_header = APIKeyHeader(name="Authorization")


async def session_profile(authorization: str = Security(api_header)) -> Profile:
    """Dependency that provides the profile record for the current authorization header"""
    return get_profile(authorization)


async def current_cookie_profile(request: Union[WebSocket, Request]) -> Profile:
    """Retrieve the profile based on a token stored in cookies"""
    token = request.cookies.get("Authorization")
    if not token:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="Not authenticated")
    return get_profile(token)


async def session_profile_roles(authorization: str = Security(api_header)) -> (Profile, list[str]):
    """Dependency that provides the profile record and roles for the current authorization header"""
    return get_profile_roles(authorization)


async def maybe_session_profile(
        authorization: Optional[str] = Header(None)
) -> Optional[Profile]:
    """Dependency to provide the profile if the authorization is provided else None reference"""
    if authorization is None:
        return None
    try:
        return await session_profile(authorization)
    except HTTPException as e:
        if e.status_code == HTTPStatus.FORBIDDEN:
            return None
        raise


async def session_profile_id(authorization: Annotated[str | None, Header()]) -> str:
    """Dependency that provides the profile ID for the current authorization header"""
    profile = get_profile(authorization)
    if profile is None:
        return ''
    return profile_seq_to_id(profile.profile_seq)
