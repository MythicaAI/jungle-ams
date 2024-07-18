"""Profiles API"""
import logging
from http import HTTPStatus
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError, BaseModel, constr, AnyHttpUrl, EmailStr
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import select, update, delete, col

from auth.generate_token import generate_token
from config import app_config
from db.connection import get_session
from db.schema.profiles import Profile, ProfileSession
from routes.authorization import current_profile
from routes.responses import ProfileResponse, SessionStartResponse, ValidateEmailState, PublicProfileResponse

router = APIRouter(prefix="/profiles", tags=["profiles"])

log = logging.getLogger(__name__)

MIN_PROFILE_NAME = 3
MAX_PROFILE_NAME = 20
profile_name_str = constr(strip_whitespace=True, min_length=3, max_length=64)


# Define a dictionary with the attributes you want to validate
class CreateUpdateProfileModel(BaseModel):
    """A model with only allowed public properties for profile creation"""
    name: profile_name_str
    description: constr(strip_whitespace=True, min_length=0, max_length=400) | None = None
    signature: constr(min_length=32, max_length=400) | None = None
    profile_base_href: Optional[AnyHttpUrl] = None
    email: EmailStr = None


def email_validate_state_enum(email_validation_state: int) -> ValidateEmailState:
    """Convert the database int to the pydantic enum"""
    if email_validation_state == 0:
        return ValidateEmailState.not_validated
    elif email_validation_state == 1:
        return ValidateEmailState.link_sent
    elif email_validation_state == 2:
        return ValidateEmailState.validated
    return ValidateEmailState.not_validated


def profile_to_profile_response(profile: Profile, model_type: type) \
        -> ProfileResponse | PublicProfileResponse:
    """Convert a profile to a valid profile response object"""
    profile_data = profile.model_dump()
    validate_state = email_validate_state_enum(profile.email_validate_state)
    profile_response = model_type(**profile_data,
                                  validate_state=validate_state)
    return profile_response


@router.get('/start_session/{profile_id}')
async def start_session(profile_id: UUID) -> SessionStartResponse:
    """Start a session for a profile"""
    with get_session() as session:
        session.begin()
        result = session.exec(update(Profile).values(
            {'login_count': Profile.login_count + 1, 'active': True}).where(
            Profile.id == profile_id))
        session.commit()

        if result.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                detail='profile not found')

        session.exec(delete(ProfileSession).where(
            ProfileSession.profile_id == profile_id))
        session.commit()

        # Generate a new token and profile response
        profile = session.exec(select(Profile).where(
            Profile.id == profile_id)).first()
        if profile is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"profile {profile_id} not found")
        profile_response = profile_to_profile_response(profile, ProfileResponse)
        token = generate_token(profile)

        # Add a new session
        location = app_config().mythica_location
        profile_session = ProfileSession(profile_id=profile_id,
                                         refreshed=sql_now(),
                                         location=location,
                                         authenticated=False,
                                         auth_token=token)
        session.add(profile_session)
        session.commit()

        sessions = session.exec(select(ProfileSession).where(
            ProfileSession.profile_id == profile_id)).all()
        sessions = [ProfileSession(**s.model_dump()) for s in sessions]

        result = SessionStartResponse(
            token=token,
            profile=profile_response,
            sessions=sessions)
        return result


@router.get('/named/{profile_name}')
async def get_profile_by_name(profile_name: profile_name_str, exact_match: Optional[bool] = False) \
        -> list[PublicProfileResponse]:
    """Get asset by name"""
    with get_session() as session:
        if exact_match:
            results = session.exec(select(Profile).where(Profile.name == profile_name)).all()
        else:
            results = session.exec(select(Profile)
                                   .where(col(Profile.name)  # pylint: disable=no-member
                                          .contains(profile_name))
                                   ).all()
        return [profile_to_profile_response(x, PublicProfileResponse) for x in results]


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_profile(
        req_profile: CreateUpdateProfileModel) -> ProfileResponse:
    """Create a new profile"""
    session = get_session()
    try:
        # copy over the request parameters as they have been auto validated,
        # do any remaining fixup
        profile = Profile(**req_profile.model_dump())
        profile.profile_base_href = str(req_profile.profile_base_href)

    except TypeError as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=str(e)) from e
    except ValidationError as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=str(e)) from e

    session.add(profile)
    session.commit()
    session.refresh(profile)

    return profile_to_profile_response(profile, ProfileResponse)


@router.get('/{profile_id}')
async def get_profile(profile_id: UUID) -> PublicProfileResponse:
    """Get a profile by ID"""
    with get_session() as session:
        profile = session.exec(select(Profile).where(
            Profile.id == profile_id)).first()
        if profile is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"profile {profile_id} not found")
        return profile_to_profile_response(profile, PublicProfileResponse)


@router.post('/{profile_id}')
async def update_profile(
        profile_id: UUID,
        req_profile: CreateUpdateProfileModel,
        profile: Profile = Depends(current_profile)) -> ProfileResponse:
    """Update the profile of the owning account"""
    if profile_id != profile.id:
        raise HTTPException(HTTPStatus.FORBIDDEN,
                            detail='profile not authenticated')

    session = get_session(echo=True)
    stmt = update(Profile).where(
        Profile.id == profile_id).values(
        **req_profile.model_dump())
    result = session.execute(stmt)
    rows_affected = result.rowcount
    if rows_affected == 0:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail='missing profile')
    session.commit()

    updated = session.exec(select(Profile).where(
        Profile.id == profile_id)).one()
    return profile_to_profile_response(updated, ProfileResponse)
