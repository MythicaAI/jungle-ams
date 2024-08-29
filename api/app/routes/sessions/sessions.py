import logging
from datetime import datetime, timezone
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlmodel import delete, select, update

from auth.api_id import profile_id_to_seq
from db.connection import get_session
from db.schema.profiles import Profile, ProfileKey, ProfileSession
from profiles.responses import SessionStartResponse
from profiles.start_session import start_session, start_session_with_token_validator

router = APIRouter(prefix="/sessions", tags=["sessions"])
log = logging.getLogger(__name__)


class Auth0SpaStartRequest(BaseModel):
    access_token: Optional[str] = None
    user_id: Optional[str] = None


@router.get('/direct/{profile_id}')
async def start_session_direct(profile_id: str) -> SessionStartResponse:
    """Start a session directly for a profile"""
    with get_session() as session:
        if '@' in profile_id:
            profile = session.exec(select(Profile).where(Profile.email == profile_id)).first()
            if profile is None:
                raise HTTPException(HTTPStatus.NOT_FOUND, f"profile with email {profile_id} not found")
            profile_seq = profile.profile_seq
        else:
            profile_seq = profile_id_to_seq(profile_id)

        return start_session(session, profile_seq)


@router.get('/key/{api_key}')
async def start_session_key(api_key: str) -> SessionStartResponse:
    with get_session() as session:
        # pylint: disable=no-member
        key_result = session.exec(select(ProfileKey).where(ProfileKey.key == api_key)).one_or_none()
        if key_result is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"profile key {api_key} not found or invalid")

        # test for key expiration and remove expired key
        if key_result.expires <= datetime.now(timezone.utc):
            session.exec(delete(ProfileKey).where(ProfileKey.key == api_key))
            session.commit()
            raise HTTPException(HTTPStatus.FORBIDDEN, f"profile key {api_key} expired")

        # start the session using the key
        return start_session(session, key_result.owner_seq)


validator = Auth0Validator()


@router.post('/auth0-spa')
async def start_session_auth0_spa(req: Auth0SpaStartRequest) -> SessionStartResponse:
    """Post the auth0 user metadata with the access token to begin an API session"""
    await start_session_with_token_validator(req.access_token, validator)


@router.delete('{profile_id}')
async def stop_session(profile_id: str):
    """Stop a session for a profile"""
    with get_session() as session:
        profile_seq = profile_id_to_seq(profile_id)

        session.begin()
        result = session.exec(update(Profile).values(
            {'active': False}).where(
            Profile.profile_seq == profile_seq))

        session.exec(delete(ProfileSession).where(
            ProfileSession.profile_seq == profile_seq))

        session.commit()

        if result.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                detail='profile not found')
