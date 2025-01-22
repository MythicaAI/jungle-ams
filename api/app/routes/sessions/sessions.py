from http import HTTPStatus

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from functools import lru_cache
from pydantic import BaseModel
from sqlmodel import col, delete as sql_delete, select, update
from typing import Optional

from db.connection import TZ, get_session
from db.schema.profiles import Profile, ProfileKey, ProfileSession
from profiles.auth0_validator import Auth0Validator
from profiles.responses import SessionStartResponse
from profiles.start_session import start_session, start_session_with_token_validator
from routes.authorization import session_profile

router = APIRouter(prefix="/sessions", tags=["sessions"])
log = logging.getLogger(__name__)


class Auth0SpaStartRequest(BaseModel):
    access_token: Optional[str] = None
    user_id: Optional[str] = None


def get_client_ip(request: Request) -> str:
    """Get the IP address of the requesting client"""
    client_ip = request.headers.get('X-Forwarded-For')
    if client_ip:
        # In case there are multiple IPs, take the first one
        return client_ip.split(",")[0]
    else:
        return request.client.host


@lru_cache()
def cached_validator():
    """Provide a cached accessor the validator"""
    return Auth0Validator()


async def get_auth_validator() -> Auth0Validator:
    """Dependency provider for auth token validation"""
    return cached_validator()


@router.get('/key/{api_key}')
async def key(request: Request,
              api_key: str,
              impersonate_profile_id: str = Header(None, include_in_schema=False)) -> SessionStartResponse:
    """Start a new session by providing an API key"""
    client_ip = get_client_ip(request)
    with get_session() as session:
        # pylint: disable=no-member
        key_result = session.exec(select(ProfileKey).where(ProfileKey.key == api_key)).one_or_none()
        if key_result is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"profile key {api_key} not found or invalid")

        # test for key expiration and remove expired key
        if key_result.expires.replace(tzinfo=TZ).astimezone(timezone.utc) <= datetime.now(timezone.utc):
            session.exec(sql_delete(ProfileKey).where(col(ProfileKey.key) == api_key))
            session.commit()
            raise HTTPException(HTTPStatus.FORBIDDEN, f"profile key {api_key} expired")

        # start the session using the key, key based authentication allows impersonation for privileged accounts
        # this use case is for automation that needs to act on behalf of other profiles
        return start_session(session, key_result.owner_seq, client_ip, impersonate_profile_id)


@router.post('/auth0-spa')
async def auth0_spa(req: Auth0SpaStartRequest,
                    validator: Auth0Validator = Depends(get_auth_validator)) -> SessionStartResponse:
    """Post the auth0 user metadata with the access token to begin an API session"""
    session_start = await start_session_with_token_validator(req.access_token, validator)
    return session_start


@router.delete('/')
async def delete(profile: Profile = Depends(session_profile)):
    """Stop a session for a profile"""
    with get_session() as session:
        session.begin()
        result = session.exec(update(Profile).values(
            {'active': False}).where(
            col(Profile.profile_seq) == profile.profile_seq))

        session.exec(sql_delete(ProfileSession).where(
            col(ProfileSession.profile_seq) == profile.profile_seq))

        session.commit()

        if result.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                detail='profile not found')
