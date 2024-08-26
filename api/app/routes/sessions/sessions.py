import logging
from http import HTTPStatus
from typing import Optional

import httpx
import jwt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import Session, col, delete, insert, select, update

from auth.api_id import profile_id_to_seq, profile_seq_to_id
from auth.generate_token import generate_token
from config import app_config
from db.connection import get_session
from db.schema.profiles import Profile, ProfileSession
from routes.responses import ProfileResponse, SessionStartResponse, profile_to_profile_response

router = APIRouter(prefix="/sessions", tags=["sessions"])
log = logging.getLogger(__name__)


class Auth0SpaStartRequest(BaseModel):
    access_token: Optional[str] = None
    user_id: Optional[str] = None


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

        return start_session_internal(session, profile_seq)


def start_session_internal(session: Session, profile_seq: int) -> SessionStartResponse:
    """Given a database session start a new session"""
    profile_id = profile_seq_to_id(profile_seq)
    # Delete existing sessions
    result = session.exec(update(Profile).values(
        {'login_count': Profile.login_count + 1, 'active': True}).where(
        Profile.profile_seq == profile_seq))
    if result.rowcount == 0:
        raise HTTPException(HTTPStatus.NOT_FOUND,
                            detail='profile not found')
    session.commit()

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


@router.post('/auth0-spa')
async def start_auth0_spa_session(req: Auth0SpaStartRequest) -> SessionStartResponse:
    """Post the auth0 user metadata with the access token to begin an API session"""
    log.info("starting session with token: %s", req.access_token)

    user_info_url = f'https://{app_config().auth0_domain}/userinfo'
    authorization_header = {
        'Authorization': f'Bearer {req.access_token}'
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_url, headers=authorization_header)
        log.info(response.status_code)

    jwks_url = f'https://{app_config().auth0_domain}/.well-known/jwks.json'
    jwks_client = jwt.PyJWKClient(jwks_url)
    signing_key = jwks_client.get_signing_key(req.access_token)
    payload = jwt.decode(
        req.access_token,
        signing_key,
        audience=app_config().auth0_audience,
        issuer="https://" + app_config().auth0_domain)
    log.info("payload: %s", payload)

    stmt = select(Profile).where(col(Profile.email) == req.email)
    with get_session() as session:
        profile = session.exec(stmt).one_or_none()
        if profile is None:
            if req.email_verified:
                validate_email_state = 1
            else:
                validate_email_state = 0
            insert_stmt = insert(Profile).values(
                name=req.nickname,
                full_name=req.name,
                email=req.email,
                email_validate_state=validate_email_state,
            )
            session.execute(insert_stmt)
            session.commit()
            profile = session.exec(select(Profile).where(Profile.email == req.email)).one_or_none()
        if profile is None:
            raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE, "profile could not be resolved")
        return start_session_internal(session, profile.profile_seq)


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
