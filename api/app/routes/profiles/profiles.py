"""Profiles API"""

import logging
from http import HTTPStatus
from typing import Optional, Union

from fastapi import APIRouter, Depends, HTTPException
from pydantic import AnyHttpUrl, BaseModel, EmailStr, ValidationError, constr
from sqlmodel import col, select, update

import auth.roles
from auth.authorization import Scope, Test, validate_roles
from cryptid.cryptid import profile_id_to_seq
from db.connection import get_session
from db.schema.profiles import Profile
from profiles.load_profile_and_roles import load_profile_and_roles
from profiles.responses import (
    ProfileResponse,
    ProfileRolesResponse, PublicProfileResponse,
    profile_to_profile_response,
)
from routes.authorization import maybe_session_profile, session_profile, session_profile_roles

router = APIRouter(prefix="/profiles", tags=["profiles"])

log = logging.getLogger(__name__)

MIN_PROFILE_NAME = 3
MAX_PROFILE_NAME = 20
profile_name_str = constr(strip_whitespace=True, min_length=3, max_length=64)


class CreateUpdateProfileModel(BaseModel):
    """Profile subset properties for creation and updating"""
    name: profile_name_str | None = None
    description: constr(strip_whitespace=True, min_length=0, max_length=400) | None = (
        None
    )
    signature: constr(min_length=32, max_length=400) | None = None
    profile_base_href: Optional[AnyHttpUrl] = None
    email: EmailStr = None


@router.get('/named/{profile_name}')
async def get_profile_by_name(
        profile_name: profile_name_str,
        exact_match: Optional[bool] = False
) -> list[PublicProfileResponse]:
    """Get asset by name"""
    with get_session() as session:
        if exact_match:
            results = session.exec(
                select(Profile).where(Profile.name == profile_name)
            ).all()
        else:
            results = session.exec(
                select(Profile).where(
                    col(Profile.name).contains(  # pylint: disable=no-member
                        profile_name
                    )
                )
            ).all()
        return [
            profile_to_profile_response(
                x,
                PublicProfileResponse)
            for x in results
        ]


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_profile(req_profile: CreateUpdateProfileModel) -> ProfileResponse:
    """Create a new profile"""
    session = get_session()
    try:
        # copy over the request parameters as they have been auto validated,
        # do any remaining fixup
        profile = Profile(**req_profile.model_dump())
        profile.profile_base_href = str(req_profile.profile_base_href)

    except (TypeError, ValidationError) as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=str(e)) from e

    session.add(profile)
    session.commit()

    session.refresh(profile)
    profile = session.exec(
        select(Profile).where(Profile.profile_seq == profile.profile_seq)
    ).one()

    return profile_to_profile_response(profile, ProfileResponse)


@router.get('/{profile_id}')
async def get_profile(
        profile_id: str,
        auth_profile: Optional[Profile] = Depends(maybe_session_profile),
) -> Union[PublicProfileResponse, ProfileResponse]:
    """Get a profile by ID"""
    with get_session() as session:
        profile_seq = profile_id_to_seq(profile_id)
        profile: Profile = session.exec(
            select(Profile).where(Profile.profile_seq == profile_seq)
        ).first()

        if profile is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"profile {profile_id} not found")
        if auth_profile:
            return profile_to_profile_response(
                profile,
                ProfileResponse)

        return profile_to_profile_response(
            profile,
            PublicProfileResponse)


@router.get('/{profile_id}/roles')
async def roles(
        profile_id: str,
        _: Optional[Profile] = Depends(session_profile),
) -> ProfileRolesResponse:
    """Get a profile by ID"""
    with get_session() as session:
        profile_seq = profile_id_to_seq(profile_id)
        profile, org_roles = load_profile_and_roles(session, profile_seq)
        profile_response = profile_to_profile_response(profile, PublicProfileResponse)
        return ProfileRolesResponse(
            profile=profile_response,
            org_roles=org_roles,
        )


@router.post('/{profile_id}')
async def update_profile(
        profile_id: str,
        req_profile: CreateUpdateProfileModel,
        profile_roles=Depends(session_profile_roles),
) -> ProfileResponse:
    """Update the profile of the owning account"""
    profile, roles = profile_roles
    validate_roles(Test(role=auth.roles.profile_update, object_id=profile_id),
                   roles,
                   Scope(profile=profile))

    profile_seq = profile_id_to_seq(profile_id)
    session = get_session(echo=True)
    values = req_profile.model_dump(exclude_unset=True)

    # Only update if at least one value is supplied
    if len(values.keys()) > 0:
        stmt = update(Profile).values(**values).where(Profile.profile_seq == profile_seq)
        result = session.execute(stmt)
        rows_affected = result.rowcount
        if rows_affected == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail='missing profile')

        session.commit()

    read_committed = session.exec(
        select(Profile).where(Profile.profile_seq == profile_seq)
    ).one()
    return profile_to_profile_response(read_committed, ProfileResponse)
