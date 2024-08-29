"""
This module is designed to start a new session given a known profile sequence number. It updates
the profile and generates a session start response.
"""
from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import Session, delete, select, update

from auth.api_id import profile_seq_to_id
from auth.generate_token import generate_token
from config import app_config
from db.schema.profiles import Profile, ProfileSession
from profiles.responses import ProfileResponse, SessionStartResponse, profile_to_profile_response


def start_session(session: Session, profile_seq: int) -> SessionStartResponse:
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


async def start_session_with_token_validator(token: str, validator: TokenValidator):
    log.info("starting session with token: %s", req.access_token)

    jwks_client = jwt.PyJWKClient(jwks_url)
    signing_key = jwks_client.get_signing_key(kid)

    payload = jwt.decode(
        req.access_token,
        signing_key.key,
        algorithms=[header['alg']],
        audience=app_config().auth0_audience,
        issuer=f"https://{app_config().auth0_domain}/")
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
        return start_session(session, profile.profile_seq)
