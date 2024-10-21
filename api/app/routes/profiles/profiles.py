"""Profiles API"""
import logging
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import AnyHttpUrl, BaseModel, EmailStr, ValidationError, constr
from sqlmodel import col, select, update

from cryptid.cryptid import profile_id_to_seq, profile_seq_to_id
from db.connection import get_session
from db.schema.profiles import Profile
from profiles.responses import ProfileResponse, PublicProfileResponse, profile_to_profile_response
from routes.authorization import current_profile

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


@router.get('/named/{profile_name}')
async def by_name(profile_name: profile_name_str, exact_match: Optional[bool] = False) \
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
async def create(
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
async def by_id(profile_id: str) -> PublicProfileResponse:
    """Get a profile by ID"""
    with get_session() as session:
        profile_seq = profile_id_to_seq(profile_id)
        profile = session.exec(select(Profile).where(
            Profile.profile_seq == profile_seq)).first()
        if profile is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"profile {profile_id} not found")
        return profile_to_profile_response(profile, PublicProfileResponse)


@router.post('/{profile_id}')
async def update(
        profile_id: str,
        req_profile: CreateUpdateProfileModel,
        profile: Profile = Depends(current_profile)) -> ProfileResponse:
    """Update the profile of the owning account"""
    if profile_id != profile_seq_to_id(profile.profile_seq):
        raise HTTPException(HTTPStatus.FORBIDDEN,
                            detail='profile not authenticated')
    profile_seq = profile_id_to_seq(profile_id)
    session = get_session(echo=True)
    stmt = update(Profile).where(
        Profile.profile_seq == profile_seq).values(
        **req_profile.model_dump())
    result = session.execute(stmt)
    rows_affected = result.rowcount
    if rows_affected == 0:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail='missing profile')
    session.commit()

    updated = session.exec(select(Profile).where(
        Profile.profile_seq == profile_seq)).one()
    return profile_to_profile_response(updated, ProfileResponse)
