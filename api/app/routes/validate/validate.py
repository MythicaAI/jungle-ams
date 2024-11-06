import logging
import secrets
import string
from datetime import datetime, timedelta, timezone
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import delete, insert, select, update

from config import app_config
from cryptid.cryptid import profile_seq_to_id
from db.connection import get_session
from db.schema.profiles import Profile, ProfileKey
from profiles.invalidate_sessions import invalidate_sessions
from routes.authorization import session_profile
from validate_email.responses import ValidateEmailResponse, ValidateEmailState

router = APIRouter(prefix="/validate-email", tags=["profiles"])

log = logging.getLogger(__name__)

KEY_PREFIX = 'v_'


@router.get('/')
async def begin_email(
        profile: Profile = Depends(session_profile)) -> ValidateEmailResponse:
    """Start validating an email address stored on the current profile"""
    with get_session() as session:
        validate_code = KEY_PREFIX + ''.join(secrets.choice(string.ascii_letters) for _ in range(20))
        validate_link = f"https://api.mythica.ai/v1/validate_email/{validate_code}"
        session.exec(insert(ProfileKey).values(
            key=validate_code,
            owner_seq=profile.profile_seq,
            expires=datetime.now(timezone.utc) + timedelta(minutes=60),
            payload={
                'source': '/validate_email',
                'verification_link': validate_link
            }
        ))
        session.exec(update(Profile).values(
            email_validate_state=ValidateEmailState.db_value(ValidateEmailState.link_sent)
        ).where(
            Profile.profile_seq == profile.profile_seq
        ))
        session.commit()
        return ValidateEmailResponse(owner_id=profile_seq_to_id(profile.profile_seq),
                                     link=validate_link,
                                     code=validate_code,
                                     state=ValidateEmailState.link_sent)


@router.get('/{verification_code}')
async def complete_email(
        verification_code: str,
        profile: Profile = Depends(session_profile)) -> ValidateEmailResponse:
    """Provide a valid verification code to validate email"""
    with get_session() as session:
        validate_profile = session.exec(select(Profile).where(
            Profile.profile_seq == profile.profile_seq)).first()
        if validate_profile.profile_seq != profile.profile_seq:
            raise HTTPException(HTTPStatus.FORBIDDEN, detail='session profile mismatch')

        # query the validation key for the profile
        validate_key = session.exec(select(ProfileKey).where(
            ProfileKey.key == verification_code)).first()
        if validate_key is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail='verification link is missing')

        # validate the profile matches up
        if validate_key.owner_seq != profile.profile_seq:
            raise HTTPException(HTTPStatus.FORBIDDEN, detail='verification profile mismatch')

        # extract and validate the payload
        validation_payload = validate_key.payload
        if validation_payload.get('source', '') != '/validate_email':
            raise HTTPException(HTTPStatus.NOT_FOUND, detail='invalid validation source')

        # mark the profile email validation complete
        session.exec(update(Profile).values(
            {Profile.email_validate_state:
                 ValidateEmailState.db_value(ValidateEmailState.validated)}).where(
            Profile.profile_seq == profile.profile_seq))

        # remove the verification code
        session.exec(delete(ProfileKey).where(
            ProfileKey.key == verification_code
        ))

        invalidate_sessions(session, profile.profile_seq)

        session.commit()

        return ValidateEmailResponse(
            owner_id=profile_seq_to_id(profile.profile_seq),
            code=verification_code,
            link=app_config().api_base_uri,
            state=ValidateEmailState.validated)
