import logging
import secrets
import string
from datetime import datetime, timedelta, timezone
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import delete, insert, select, update
from sqlmodel.ext.asyncio.session import AsyncSession

from gcid.gcid import profile_seq_to_id
from db.connection import get_db_session
from db.schema.profiles import Profile, ProfileKey
from profiles.invalidate_sessions import invalidate_sessions
from meshwork.models.sessions import SessionProfile
from routes.authorization import session_profile
from validate_email.responses import ValidateEmailResponse, ValidateEmailState, email_validate_state_enum
from validate_email.verification import send_validating_email

router = APIRouter(prefix="/validate-email", tags=["profiles"])

log = logging.getLogger(__name__)

KEY_PREFIX = "v_"


@router.get("/")
async def begin_email(
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> ValidateEmailResponse:
    """Start validating an email address stored on the current profile"""
    if email_validate_state_enum(profile.email_validate_state) == ValidateEmailState.validated:
        return ValidateEmailResponse(
            owner_id=profile_seq_to_id(profile.profile_seq),
            state=ValidateEmailState.validated,
        )

    validate_code = KEY_PREFIX + "".join(secrets.choice(string.ascii_letters) for _ in range(20))
    validate_link = f"https://api.mythica.ai/v1/validate_email/{validate_code}"
    insert_result = await db_session.exec(insert(ProfileKey).values(
        key=validate_code,
        owner_seq=profile.profile_seq,
        expires=datetime.now(timezone.utc) + timedelta(minutes=60),
        payload={
            "source": "/validate_email",
            "verification_link": validate_link
        }
    ))
    await db_session.commit()
    insert_result = insert_result.inserted_primary_key[0]
    if not insert_result:
        raise ValueError("failed to insert validation link")

    is_sent = send_validating_email(validate_link, profile.email)
    if is_sent:
        await db_session.exec(update(Profile).values(
            email_validate_state=ValidateEmailState.db_value(ValidateEmailState.link_sent)
        ).where(
            Profile.profile_seq == profile.profile_seq
        ))
        await db_session.commit()
        state = ValidateEmailState.link_sent
    else:
        state = ValidateEmailState.not_validated

    return ValidateEmailResponse(
        owner_id=profile_seq_to_id(profile.profile_seq),
        state=state,
    )


@router.get("/{verification_code}")
async def complete_email(
        verification_code: str,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> ValidateEmailResponse:
    """Provide a valid verification code to validate email"""
    if email_validate_state_enum(profile.email_validate_state) == ValidateEmailState.validated:
        return ValidateEmailResponse(
            owner_id=profile_seq_to_id(profile.profile_seq),
            state=ValidateEmailState.validated,
        )

    validate_profile = (await db_session.exec(select(Profile).where(
        Profile.profile_seq == profile.profile_seq))).one_or_none()
    if validate_profile is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="profile not found")
    if validate_profile.profile_seq != profile.profile_seq:
        raise HTTPException(HTTPStatus.FORBIDDEN, detail="session profile mismatch")

    # query the validation key for the profile
    validate_key_result = await db_session.exec(select(ProfileKey).where(
        ProfileKey.key == verification_code))
    validate_key = validate_key_result.one_or_none()
    if validate_key is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="verification link is missing")

    # validate the profile matches up
    if validate_key.owner_seq != profile.profile_seq:
        raise HTTPException(HTTPStatus.FORBIDDEN, detail="verification profile mismatch")

    # validate the expire time
    if validate_key.expires.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(HTTPStatus.GONE, detail="Verification code expired")

        # extract and validate the payload
    validation_payload = validate_key.payload
    if validation_payload.get("source", "") != "/validate_email":
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="invalid validation source")

    # mark the profile email validation complete
    await db_session.exec(update(Profile).values(
        {Profile.email_validate_state:
             ValidateEmailState.db_value(ValidateEmailState.validated)}).where(
        Profile.profile_seq == profile.profile_seq))

    # remove the verification code
    await db_session.exec(delete(ProfileKey).where(ProfileKey.key == verification_code))

    await invalidate_sessions(db_session, profile.profile_seq)

    await db_session.commit()

    return ValidateEmailResponse(
        owner_id=profile_seq_to_id(profile.profile_seq),
        state=ValidateEmailState.validated,
    )
