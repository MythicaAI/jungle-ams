import logging
from datetime import datetime, timezone
from http import HTTPStatus
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError, BaseModel, constr, AnyHttpUrl, EmailStr

from auth.generate_token import generate_token
from config import app_config
from db.schema.profiles import Profile, ProfileSession
from db.connection import get_session
from sqlmodel import select, update, delete
from routes.responses import ProfileResponse, SessionStartResponse
from routes.authorization import current_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])

log = logging.getLogger(__name__)


# Define a dictionary with the attributes you want to validate
class CreateUpdateProfileModel(BaseModel):
    """A model with only allowed public properties for profile creation"""
    name: constr(strip_whitespace=True, min_length=3, max_length=20)
    description: constr(strip_whitespace=True, min_length=0, max_length=400) | None = None
    signature: constr(min_length=32, max_length=400) | None = None
    profile_base_href: Optional[AnyHttpUrl] = None
    email: EmailStr = None



@router.get('/')
async def get_profiles() -> list[ProfileResponse]:
    with get_session() as session:
        return [ProfileResponse(**profile.model_dump())
                for profile in session.exec(select(Profile))]


@router.get('/{profile_id}')
async def get_profile(profile_id: UUID) -> ProfileResponse:
    with get_session() as session:
        profile = session.exec(select(Profile).where(
            Profile.id == profile_id)).first()
        return ProfileResponse(**profile.model_dump())


@router.get('/start_session/{profile_id}')
async def start_session(profile_id: UUID) -> SessionStartResponse:
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

        # Generate a new token
        profile = session.exec(select(Profile).where(
            Profile.id == profile_id)).first()
        profile_data = profile.model_dump()
        token = generate_token(profile)

        # Add a new session
        location = app_config().mythica_location
        profile_session = ProfileSession(profile_id=profile_id,
                                         refreshed=datetime.now(timezone.utc),
                                         location=location,
                                         authenticated=False,
                                         auth_token=token)
        session.add(profile_session)
        session.commit()

        sessions = session.exec(select(ProfileSession).where(
            ProfileSession.profile_id == profile_id)).all()
        sessions = [ProfileSession(**s.model_dump()) for s in sessions]

        profile_summary = ProfileResponse(**profile_data)

        result = SessionStartResponse(
            token=token,
            profile=profile_summary,
            sessions=sessions)
        return result


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_profile(
        req_profile: CreateUpdateProfileModel) -> ProfileResponse:
    session = get_session()
    try:
        profile = Profile(**req_profile.model_dump())
    except TypeError as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=str(e)) from e
    except ValidationError as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=str(e)) from e

    session.add(profile)
    session.commit()
    session.refresh(profile)

    return ProfileResponse(**profile.model_dump())


@router.post('/{profile_id}')
async def update_profile(
        profile_id: UUID,
        req_profile: CreateUpdateProfileModel,
        profile: Profile = Depends(current_profile)) -> ProfileResponse:
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
    return ProfileResponse(**updated.model_dump())
