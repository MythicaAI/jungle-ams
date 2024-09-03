"""
This module is designed to start a new session given a known profile sequence number. It updates
the profile and generates a session start response.
"""
import logging
from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import Session, col, delete, insert, select, update


from auth.api_id import profile_seq_to_id
from auth.generate_token import generate_token
from config import app_config
from db.connection import get_session
from db.schema.profiles import Profile, ProfileLocatorOID, ProfileSession
from profiles.auth0_validator import AuthTokenValidator, TokenValidatorResponse
from profiles.responses import ProfileResponse, SessionStartResponse, profile_to_profile_response

log = logging.getLogger(__name__)


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


async def start_session_with_token_validator(token: str, validator: AuthTokenValidator):
    """Given a token and a validator, validate the token - the token validator must
    return the user metadata which will be used to locate a profile and continue
    with the session logic"""
    log.info("starting session with token: %s", token)
    response = await validator.validate(token)

    with (get_session() as session):
        # get all profiles with the email, with the oldest profile as the first result
        profiles = session.exec(select(Profile)
                                .where(col(Profile.email) == response.email)
                                .order_by(Profile.created.ascending)).all()
        if profiles is None or len(profiles) == 0:
            # if there are no profiles, attempt to associate the sub to a new profile
            profile_seq = await create_profile_for_oid(session, response)
            await create_profile_locator_oid(session, response, profile_seq)
        else:
            # at least one profile exists, look for an existing association of the unique sub key
            locator_oid = session.exec(select(ProfileLocatorOID)
                                       .where(col(ProfileLocatorOID.sub) == response.sub)).one_or_none()
            top_profile = profiles[0]
            if locator_oid is not None:
                if locator_oid.owner_seq == top_profile.profile_seq:
                    start_session(session, top_profile.profile_seq, locator_oid.sub)
            else:
                await associate_profile(session, top_profile, response)



async def associate_profile(session: Session, response: TokenValidatorResponse):
    r = session.exec(select(Profile).where(col(Profile.email) == response.email)).all()
    for profile in r:
        if response.email_verified:
            validate_email_state = 1
        else:
            validate_email_state = 0
        insert_stmt = insert(Profile).values(
            name=response.nickname,
            full_name=response.name,
            email=response.email,
            email_validate_state=validate_email_state,
        )
        session.execute(insert_stmt)
        session.commit()
        profile = session.exec(select(Profile).where(Profile.email == validator_response.email)).one_or_none()
    if profile is None:
        raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE, "profile could not be resolved")
    return start_session(session, profile.profile_seq)


async def merge_profile(session: Session, response: TokenValidatorResponse, locator_oid: ProfileLocatorOID):
    results = session.exec(select(Profile).where(col(Profile.email) == response.email)).all()
    if results is None or len(results) == 0:
        owner_seq = await create_profile_for_oid(session, response)
        await create_profile_locator_oid(session, response, owner_seq)
    elif len(results) > 1:
        profile = next(sorted(results, key=lambda p: p.profile_seq))
    else:
        profile = results[0]

    if profile is None:
        raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE, "profile could not be resolved")
    return start_session(session, profile.profile_seq)


def email_validate_state(email_verified):
    if email_verified:
        return 1
    else:
        return 0

def find_best_profile(profiles: list[Profile], sub: str):
    best_profile = None
    for profile in profiles:
        if profile.location == sub:
            best_profile = profile
        else:
            if best_profile is None or best_profile.location == sub: < profile.login_count

async def create_profile_locator_oid(session: Session, response: TokenValidatorResponse, owner_seq):
    r = session.exec(insert(ProfileLocatorOID).values(sub=response.sub, owner_seq=owner_seq))
    if r is None or r.rowcount == 0:
        raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE, "OID locator could not be created")


async def create_profile_for_oid(
        session: Session,
        response: TokenValidatorResponse) -> int:
    r = session.exec(insert(Profile).values(
        name=response.nickname,
        full_name=response.name,
        email=response.email,
        email_validate_state=email_validate_state(response.email_verified),
    ))
    if r.rowcount == 0:
        raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE, "profile could not be created")
    owner_seq = r.inserted_primary_key[0]
    return owner_seq
