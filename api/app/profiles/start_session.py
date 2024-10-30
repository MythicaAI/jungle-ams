"""
This module is designed to start a new session given a known profile sequence number. It updates
the profile and generates a session start response.
"""
import logging
from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy.sql.functions import func, now as sql_now
from sqlmodel import Session, asc, col, delete, insert, select, update

from cryptid.cryptid import profile_seq_to_id
from auth.generate_token import generate_token
from db.connection import get_session
from db.schema.profiles import Profile, ProfileLocatorOID, ProfileSession
from profiles.auth0_validator import AuthTokenValidator, UserProfile, ValidTokenPayload
from profiles.responses import ProfileResponse, SessionStartResponse, profile_to_profile_response

log = logging.getLogger(__name__)


def start_session(session: Session, profile_seq: int, location: str) -> SessionStartResponse:
    """Given a database session start a new session"""
    profile_id = profile_seq_to_id(profile_seq)
    result = session.exec(update(Profile).values(
        login_count=func.coalesce(Profile.login_count, 0) + 1,
        active=True,
        location=location).where(Profile.profile_seq == profile_seq))
    if result.rowcount == 0:
        raise HTTPException(HTTPStatus.NOT_FOUND,
                            detail='profile not found')
    session.commit()

    #
    # Delete existing sessions
    #
    session.exec(delete(ProfileSession).where(
        ProfileSession.profile_seq == profile_seq))
    session.commit()

    #
    # Generate a new token
    #
    profile = session.exec(select(Profile).where(
        Profile.profile_seq == profile_seq)).first()
    if profile is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, f"profile {profile_id} not found")
    token = generate_token(profile)

    # Convert db profile to profile response
    profile_response = profile_to_profile_response(profile, ProfileResponse, session)

    # Add a new session
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


async def start_session_with_token_validator(token: str, validator: AuthTokenValidator) -> SessionStartResponse:
    """Given a token and a validator, validate the token - the token validator must
    return the user metadata which will be used to locate a profile and continue
    with the session logic"""
    log.info("starting session with token: %s", token)
    valid_token = await validator.validate(token)

    with (get_session() as session):
        #
        # look for an existing association of the unique sub key
        #
        locator_oid = session.exec(select(ProfileLocatorOID)
                                   .where(col(ProfileLocatorOID.sub) == valid_token.sub)).one_or_none()
        if locator_oid is not None:
            return start_session(session, locator_oid.owner_seq, locator_oid.sub)

        #
        # Resolve the locator to a profile, start by querying the user profile data associated with the sub
        # get all profiles with the email, with the oldest profile as the first result
        #
        user_profile = await validator.query_user_profile(token)
        profiles = session.exec(select(Profile)
                                .where(col(Profile.email) == user_profile.email)
                                .order_by(asc(Profile.created))).all()
        if profiles is None or len(profiles) == 0:
            # if there are no profiles, attempt to associate the sub to a new profile
            profile_seq = await create_profile_for_oid(session, valid_token, user_profile)
            session_start = await create_profile_locator_oid(session, valid_token, profile_seq)
            return session_start

        #
        # a locator does not exist for the token subject, in this case we will associate all profiles
        # bearing the verified email with the subject, TODO: this should be done in a two step process
        # with an email verification on our side before allowing the new sub to take over the profile
        # select the oldest profile, what to do with the rest?
        oldest_profile = sorted(profiles, key=lambda p: p.created, reverse=True)[0]
        session_start = await associate_profile(session, oldest_profile, valid_token, user_profile)
        return session_start


async def associate_profile(
        session: Session,
        profile: Profile,
        valid_token: ValidTokenPayload,
        user_profile: UserProfile) -> SessionStartResponse:
    if user_profile.email_verified:
        validate_email_state = 1
    else:
        validate_email_state = 0
    profile_insert = session.exec(insert(Profile).values(
        name=user_profile.nickname,
        full_name=user_profile.name,
        email=user_profile.email,
        email_validate_state=validate_email_state,
        location=valid_token.sub,
    ))
    profile_seq = profile_insert.inserted_primary_key[0]

    session.exec(insert(ProfileLocatorOID).values(
        sub=valid_token.sub,
        owner_seq=profile_seq,
    ))
    session.commit()

    profile = session.exec(select(Profile).where(Profile.profile_seq == profile_seq)).one_or_none()
    if profile is None:
        raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE, "profile could not be resolved")
    return start_session(session, profile.profile_seq, valid_token.sub)


async def merge_profile(
        session: Session,
        valid_token: ValidTokenPayload,
        user_profile: UserProfile,
        _: ProfileLocatorOID) -> SessionStartResponse:
    results = session.exec(select(Profile).where(col(Profile.email) == user_profile.email)).all()
    profile = None
    if results is None or len(results) == 0:
        owner_seq = await create_profile_for_oid(session, valid_token, user_profile)
        await create_profile_locator_oid(session, valid_token, owner_seq)
    else:
        profile = next(sorted(results, key=lambda p: p.profile_seq))

    if profile is None:
        raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE, "profile could not be resolved")
    return start_session(session, profile.profile_seq, valid_token.sub)


def email_validate_state(email_verified) -> int:
    if email_verified:
        return 1
    else:
        return 0


async def create_profile_locator_oid(session: Session, valid_token: ValidTokenPayload, owner_seq: int):
    r = session.exec(insert(ProfileLocatorOID).values(sub=valid_token.sub, owner_seq=owner_seq))
    if r is None or r.rowcount == 0:
        raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE, "OID locator could not be created")
    session.commit()
    return start_session(session, owner_seq, valid_token.sub)


async def create_profile_for_oid(
        session: Session,
        valid_token: ValidTokenPayload,
        user_profile: UserProfile) -> int:
    r = session.exec(insert(Profile).values(
        name=user_profile.nickname,
        full_name=user_profile.name,
        email=user_profile.email,
        email_validate_state=email_validate_state(user_profile.email_verified),
        location=valid_token.sub,
    ))
    if r.rowcount == 0:
        raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE, "profile could not be created")
    owner_seq = r.inserted_primary_key[0]
    return owner_seq
