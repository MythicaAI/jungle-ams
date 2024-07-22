import logging
import secrets
import string
from datetime import datetime, timezone, timedelta
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, update, delete, insert

from auth.api_id import profile_seq_to_id
from db.connection import get_session
from db.schema.profiles import Profile, ProfileKey
from routes.authorization import current_profile
from routes.responses import ValidateEmailState, ValidateEmailResponse

router = APIRouter(prefix="/validate-email", tags=["profiles"])

log = logging.getLogger(__name__)


@router.get('/')
async def validate_email_begin(
        profile: Profile = Depends(current_profile)) -> ValidateEmailResponse:
    """Start validating an email address stored on the current profile"""
    with get_session() as session:
        validate_code = ''.join(secrets.choice(string.ascii_letters) for _ in range(20))
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
        session.commit()
        return ValidateEmailResponse(owner_id=profile_seq_to_id(profile.profile_seq),
                                     link=validate_link,
                                     code=validate_code,
                                     state=ValidateEmailState.link_sent)


@router.get('/{verification_code}')
async def validate_email_complete(
        verification_code: str,
        profile: Profile = Depends(current_profile)) -> ValidateEmailResponse:
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
        validated = 2  # TODO: enum unification
        session.exec(update(Profile).values(
            {Profile.email_validate_state: validated}).where(
            Profile.profile_seq == profile.profile_seq))

        # remove the verification code
        session.exec(delete(ProfileKey).where(
            ProfileKey.key == verification_code
        ))

        session.commit()

        return ValidateEmailResponse(
            owner_id=profile_seq_to_id(profile.profile_seq),
            code=verification_code,
            link='https://api.mythica.ai',
            state=ValidateEmailState.validated)
