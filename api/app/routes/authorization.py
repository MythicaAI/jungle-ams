import logging
from http import HTTPStatus
from typing import Annotated, Optional, Union

from config import app_config
from cryptid.cryptid import profile_id_to_seq, profile_seq_to_id
from fastapi import HTTPException, Header, Request, Security, WebSocket
from fastapi.security.api_key import APIKeyHeader

from sqlmodel import select

from db.connection import get_session
from db.schema.profiles import Profile
from ripple.auth import roles
from ripple.auth.authorization import validate_roles
from ripple.models.sessions import SessionProfile

from auth.data import decode_session_profile

log = logging.getLogger(__name__)

api_header = APIKeyHeader(name="Authorization")


async def session_profile(authorization: str = Security(api_header)) -> SessionProfile:
    """Dependency that provides the profile record for the current authorization header"""
    profile = decode_session_profile(authorization)
    return profile


async def current_cookie_profile(request: Union[WebSocket, Request]) -> SessionProfile:
    """Retrieve the profile based on a token stored in cookies"""
    token = request.cookies.get("Authorization")
    if not token:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="Not authenticated")
    return decode_session_profile(token)


async def maybe_session_profile(
        authorization: Optional[str] = Header(None)
) -> Optional[SessionProfile]:
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
    profile = decode_session_profile(authorization)
    if profile is None:
        return ''
    return profile_seq_to_id(profile.profile_seq)
