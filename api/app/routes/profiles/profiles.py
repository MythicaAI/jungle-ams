"""Profiles API"""

import logging
from http import HTTPStatus
from typing import Optional, Union

from fastapi import APIRouter, Depends, HTTPException
from pydantic import AnyHttpUrl, BaseModel, EmailStr, ValidationError, constr
from sqlmodel import col, select, update

from cryptid.cryptid import org_seq_to_id, profile_id_to_seq, profile_seq_to_id
from db.connection import get_session
from db.schema.profiles import Org, OrgRef, Profile
from profiles.responses import (
    ProfileResponse,
    PublicProfileResponse,
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

    name: profile_name_str
    description: constr(strip_whitespace=True, min_length=0, max_length=400) | None = (
        None
    )
    signature: constr(min_length=32, max_length=400) | None = None
    profile_base_href: Optional[AnyHttpUrl] = None
    email: EmailStr = None


class ProfileOrgRoles(BaseModel):
    org_id: str
    org_name: str
    roles: list[str]


class ProfileRolesResponse(BaseModel):
    """Privileged response to queries to a given profiles roles"""
    profile: PublicProfileResponse
    org_roles: list[ProfileOrgRoles]


@router.get('/named/{profile_name}')
async def get_profile_by_name(
        profile_name: profile_name_str,
        exact_match: Optional[bool] = False,
        profile: Optional[Profile] = Depends(maybe_session_profile),
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
        auth_profile_roles: Optional[Profile] = Depends(session_profile_roles),
) -> ProfileRolesResponse:
    """Get a profile by ID"""
    auth_profile, auth_roles = auth_profile_roles
    with get_session() as session:
        profile_seq = profile_id_to_seq(profile_id)

        # collect the set of org references for the requested profile
        profile_org_results = session.exec(select(Profile, Org, OrgRef)
                                           .where(Profile.profile_seq == profile_seq)
                                           .outerjoin(OrgRef, Profile.profile_seq == OrgRef.profile_seq)
                                           .outerjoin(Org, Org.org_seq == OrgRef.org_seq)
                                           ).all()
        roles_by_org_id = {}
        org_data_by_org_id = {}
        for r in profile_org_results:
            r_profile, r_org, r_org_ref = r
            # Bail out if there are no references to process
            if r_org is None:
                return ProfileRolesResponse(
                    profile=profile_to_profile_response(r_profile, PublicProfileResponse),
                    org_roles=[]
                )

            org_id = org_seq_to_id(r_org.org_seq)
            org_data_by_org_id[org_id] = r_org.name
            roles_by_org_id.setdefault(org_id, set()).add(r_org_ref.role)

        # Convert all the org references into ProfileOrgRoles
        profile_org_roles = [
            ProfileOrgRoles(
                org_id=i,
                org_name=org_data_by_org_id.get(i, "##error"),
                roles=v
            ) for i, v in roles_by_org_id.items()
        ]
        profile = profile_org_results[0][0]
        return ProfileRolesResponse(
            profile=profile_to_profile_response(profile, PublicProfileResponse),
            org_roles=profile_org_roles)


@router.post('/{profile_id}')
async def update_profile(
        profile_id: str,
        req_profile: CreateUpdateProfileModel,
        profile: Profile = Depends(session_profile),
) -> ProfileResponse:
    """Update the profile of the owning account"""
    if profile_id != profile_seq_to_id(profile.profile_seq):
        raise HTTPException(HTTPStatus.FORBIDDEN, detail='profile not authenticated')
    profile_seq = profile_id_to_seq(profile_id)
    session = get_session(echo=True)
    stmt = (
        update(Profile)
        .where(Profile.profile_seq == profile_seq)
        .values(**req_profile.model_dump(exclude_unset=True))
    )

    result = session.execute(stmt)
    rows_affected = result.rowcount
    if rows_affected == 0:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail='missing profile')

    session.commit()

    updated = session.exec(
        select(Profile).where(Profile.profile_seq == profile.profile_seq)
    ).one()

    return profile_to_profile_response(updated, ProfileResponse)
