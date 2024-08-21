import logging
from http import HTTPStatus

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import delete, select, update

from auth.api_id import profile_id_to_seq
from auth.generate_token import generate_token
from config import app_config
from db.connection import get_session
from db.schema.profiles import Profile, ProfileSession
from routes.responses import ProfileResponse, SessionStartResponse, profile_to_profile_response

router = APIRouter(prefix="/sessions", tags=["sessions"])
log = logging.getLogger(__name__)


class Auth0UserMetadata(BaseModel):
    pass


@router.get('/direct/{profile_id}')
async def start_direct_session(profile_id: str) -> SessionStartResponse:
    """Start a session directly for a profile"""
    with get_session() as session:
        if '@' in profile_id:
            profile = session.exec(select(Profile).where(Profile.email == profile_id)).first()
            if profile is None:
                raise HTTPException(HTTPStatus.NOT_FOUND, f"profile with email {profile_id} not found")
            profile_seq = profile.profile_seq
        else:
            profile_seq = profile_id_to_seq(profile_id)

        result = session.exec(update(Profile).values(
            {'login_count': Profile.login_count + 1, 'active': True}).where(
            Profile.profile_seq == profile_seq))
        session.commit()

        if result.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                detail='profile not found')

        # Delete existing sessions
        session.exec(delete(ProfileSession).where(
            ProfileSession.profile_seq == profile_seq))
        session.commit()

        # Generate a new token and profile response
        profile = session.exec(select(Profile).where(
            Profile.profile_seq == profile_seq)).first()
        if profile is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"profile {profile_id} not found")
        profile_response = profile_to_profile_response(profile, ProfileResponse)
        token = generate_token(profile)

        # Add a new session
        location = app_config().mythica_location
        profile_session = ProfileSession(profile_seq=profile_seq,
                                         refreshed=sql_now(),
                                         location=location,
                                         authenticated=False,
                                         auth_token=token)
        session.add(profile_session)
        session.commit()

        result = SessionStartResponse(
            token=token,
            profile=profile_response)
        return result


@router.post('/auth0-spa/{access_token}')
async def start_auth0_spa_session(access_token: str):
    """Post the auth0 user metadata with the access token to begin an API session"""
    log.info("starting session with token: %s", access_token)


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
