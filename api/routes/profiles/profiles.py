"""Profiles API"""

import logging
from http import HTTPStatus
from typing import Optional, Union

from fastapi import APIRouter, Depends, HTTPException
from pydantic import AnyHttpUrl, BaseModel, EmailStr, ValidationError, constr
from sqlmodel import col, select, update as sql_update
from sqlmodel.ext.asyncio.session import AsyncSession

from gcid.gcid import profile_id_to_seq
from db.connection import get_db_session
from db.schema.profiles import Profile
from profiles.load_profile_and_roles import load_profile_and_roles
from profiles.responses import (
    ProfileResponse,
    ProfileRolesResponse, PublicProfileResponse,
    profile_to_profile_response,
)
from meshwork.auth import roles
from meshwork.auth.authorization import Scope, validate_roles
from meshwork.models.sessions import SessionProfile
from routes.authorization import maybe_session_profile, session_profile

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


@router.get("/named/{profile_name}")
async def by_name(
        profile_name: profile_name_str,
        exact_match: Optional[bool] = False,
        db_session: AsyncSession = Depends(get_db_session)
) -> list[PublicProfileResponse]:
    """Get asset by name"""
    if exact_match:
        results = (await db_session.exec(
            select(Profile).where(Profile.name == profile_name)
        )).all()
    else:
        results = (await db_session.exec(
            select(Profile).where(
                col(Profile.name).contains(  # pylint: disable=no-member
                    profile_name
                )
            )
        )).all()
    return [
        profile_to_profile_response(
            x,
            PublicProfileResponse)
        for x in results
    ]


@router.get("/roles")
async def active_roles(
        auth_profile=Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)
) -> ProfileRolesResponse:
    """Get a profile by ID"""
    profile, org_roles = await load_profile_and_roles(db_session, auth_profile.profile_seq)
    profile_response = profile_to_profile_response(profile, PublicProfileResponse)

    return ProfileRolesResponse(
        profile=profile_response,
        org_roles=org_roles,
        auth_roles=list(auth_profile.auth_roles))


@router.post("/", status_code=HTTPStatus.CREATED)
async def create(
        req_profile: CreateUpdateProfileModel,
        db_session: AsyncSession = Depends(get_db_session)) -> ProfileResponse:
    """Create a new profile"""
    try:
        # copy over the request parameters as they have been auto validated,
        # do any remaining fixup
        profile = Profile(**req_profile.model_dump())
        profile.profile_base_href = str(req_profile.profile_base_href)

    except (TypeError, ValidationError) as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=str(e)) from e
    db_session.add(profile)
    await db_session.commit()

    await db_session.refresh(profile)
    profile = (await db_session.exec(
        select(Profile).where(Profile.profile_seq == profile.profile_seq)
    )).one()

    return profile_to_profile_response(profile, ProfileResponse)


@router.get("/{profile_id}")
async def by_id(
        profile_id: str,
        auth_profile: Optional[Profile] = Depends(maybe_session_profile),
        db_session: AsyncSession = Depends(get_db_session)
) -> Union[PublicProfileResponse, ProfileResponse]:
    """Get a profile by ID"""
    profile_seq = profile_id_to_seq(profile_id)
    profile: Profile = (await db_session.exec(
        select(Profile).where(Profile.profile_seq == profile_seq)
    )).first()

    if profile is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, f"profile {profile_id} not found")
    if auth_profile:
        return profile_to_profile_response(
            profile,
            ProfileResponse)

    return profile_to_profile_response(
        profile,
        PublicProfileResponse)


@router.post("/{profile_id}")
async def update(
        profile_id: str,
        req_profile: CreateUpdateProfileModel,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)
) -> ProfileResponse:
    """Update the profile of the owning account"""
    validate_roles(role=roles.profile_update,
                   object_id=profile_id,
                   auth_roles=profile.auth_roles,
                   scope=Scope(profile=profile))

    profile_seq = profile_id_to_seq(profile_id)
    values = req_profile.model_dump(exclude_unset=True)

    # Only update if at least one value is supplied
    if len(values.keys()) > 0:
        stmt = sql_update(Profile).values(**values).where(Profile.profile_seq == profile_seq)
        result = await db_session.exec(stmt)
        rows_affected = result.rowcount
        if rows_affected == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="missing profile")

        await db_session.commit()

    read_committed = (await db_session.exec(
        select(Profile).where(Profile.profile_seq == profile_seq)
    )).one()
    return profile_to_profile_response(read_committed, ProfileResponse)
