from datetime import datetime
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, constr
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import Session, select, update, delete, insert, col

import auth.roles as roles
from auth.api_id import org_id_to_seq, profile_id_to_seq, org_seq_to_id, profile_seq_to_id
from auth.authorization import validate_roles
from auth.data import resolve_profile, resolve_roles
from db.connection import get_session
from db.schema.profiles import Profile, Org, OrgRef
from routes.authorization import current_profile

MIN_ORG_NAME = 3
MAX_ORG_NAME = 64
org_name_str = constr(strip_whitespace=True, min_length=MIN_ORG_NAME, max_length=MAX_ORG_NAME)


class OrgCreateRequest(BaseModel):
    name: org_name_str
    description: str | None = None


class OrgCreateResponse(BaseModel):
    org: Org
    admin: OrgRef


class OrgUpdateRequest(BaseModel):
    name: org_name_str
    description: str | None = None


class OrgAddRoleRequest(BaseModel):
    org_id: str
    profile_id: str
    role: str


class OrgRemoveRoleRequest(BaseModel):
    org_id: str
    profile_id: str
    role: str


class ResolvedOrgRef(OrgRef):
    org_name: str
    profile_name: str


class OrgResult(BaseModel):
    org_id: str
    name: str
    description: str | None = None
    created: datetime | None = None


router = APIRouter(prefix="/orgs", tags=["orgs"])


def resolve_and_validate(session: Session, profile: Profile, org_seq: int, required_role: str):
    # role validation
    profile = resolve_profile(session, profile)
    profile_roles = resolve_roles(session, profile, org_seq)
    if not validate_roles(required_role, profile_roles):
        raise HTTPException(HTTPStatus.FORBIDDEN,
                            detail=f"no valid roles in {profile_roles}")


def resolve_org_refs(session: Session, refs: list[OrgRef]) -> list[ResolvedOrgRef]:
    """Given a list of refs, return the resolved reference with extra data present"""
    org_seqs = set()
    profile_seqs = set()
    for ref in refs:
        org_seqs.add(org_id_to_seq(ref.org_id))
        profile_seqs.add(profile_id_to_seq(ref.profile_id))
    # pylint: disable=no-member
    orgs = {org_seq_to_id(org.org_seq): org for org in
            session.exec(select(Org).where(col(Org.org_id).in_(org_seqs))).all()}
    profiles = {profile_seq_to_id(profile.profile_seq): profile for profile in
                session.exec(select(Profile).where(col(Profile.profile_seq).in_(profile_seqs))).all()}
    results = list()
    for ref in refs:
        org = orgs.get(ref.org_id, Org())
        profile = profiles.get(ref.profile_id, Profile())
        results.append(ResolvedOrgRef(**ref.model_dump(),
                                      org_name=org.name,
                                      profile_name=profile.name))
    return results


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_org(
        create: OrgCreateRequest,
        profile: Profile = Depends(current_profile)
) -> OrgCreateResponse:
    """Create a new organization, the creating profile will be an admin"""
    with get_session() as session:
        # create the org
        org = Org(**create.model_dump())
        session.add(org)

        # create the admin from the profile
        admin = OrgRef(org_seq=org.org_seq, profile_seq=profile.profile_seq,
                       role='admin', author_seq=profile.profile_seq)
        session.add(admin)
        session.commit()
        session.refresh(admin)
        session.refresh(org)

        response = OrgCreateResponse(org=org, admin=admin)
        return response


@router.get('/named/{org_name}')
async def get_org_by_name(org_name: org_name_str, exact_match: Optional[bool] = True) -> list[ResolvedOrgRef]:
    """Get organization by name"""
    with get_session() as session:
        if exact_match:
            results = session.exec(select(Org).where(
                Org.name == org_name)).all()
        else:
            results = session.exec(select(Org).where(
                col(Org.name).contains(org_name))).all()  # pylint: disable=no-member
        return results


@router.post('/{org_id}')
async def update_org(
        org_id: str,
        req: OrgUpdateRequest,
        profile: Profile = Depends(current_profile)
) -> Org:
    """Update an existing organization"""
    with get_session(echo=True) as session:
        org_seq = org_id_to_seq(org_id)
        org = session.exec(select(Org).where(Org.org_seq == org_seq)).first()
        if org is None:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                f"org: {org_id} not found")

        resolve_and_validate(session, profile, org_seq, roles.org_update)

        r = session.exec(update(Org).where(
            Org.org_id == org_id).values(
            **req.model_dump(), updated=sql_now()))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                                f"update for: {org_id} failed")
        session.commit()
        session.refresh(org)
        return org


@router.delete('/{org_id}')
async def delete_org(org_id: str, profile: Profile = Depends(current_profile)):
    """Removes an existing organization"""
    with get_session() as session:
        resolve_and_validate(session, profile, org_id, roles.org_delete)
        session.exec(update(Org).where(
            Org.org_id == org_id).values(
            deleted=sql_now()))


@router.get('/')
async def get_org(profile: Profile = Depends(current_profile)) -> list[ResolvedOrgRef]:
    """Default get returns roles for the requesting profile"""
    with get_session() as session:
        return resolve_org_refs(session,
                                session.exec(select(OrgRef)
                                             .where(OrgRef.profile_id == profile.profile_id))
                                .all())


@router.get('/{org_id}')
async def get_org_by_id(org_id: str = None, profile: Profile = Depends(current_profile)) -> OrgResult:
    """Get organization by ID"""
    with (get_session() as session):
        if org_id is None:
            if profile is None:
                raise HTTPException(HTTPStatus.FORBIDDEN,
                                    detail="no valid profile")
            return session.exec(select(OrgRef)
                                .where(OrgRef.profile_id == profile.profile_id)
                                ).all()
        org = session.exec(select(Org).where(Org.org_id == org_id)).first()
        return OrgResult(**org.model_dump(), org_id=org_seq_to_id(org.seq))


@router.get('/{org_id}/roles')
async def get_org_roles(org_id: str) -> list[ResolvedOrgRef]:
    """Get all the roles in the organization """
    with get_session() as session:
        org_seq = org_id_to_seq(org_id)
        return resolve_org_refs(
            session,
            session.exec(select(OrgRef).where(OrgRef.org_seq == org_seq)).all())


@router.post('/{org_id}/roles/{profile_id}/{role}', status_code=HTTPStatus.CREATED)
async def add_role_to_org(
        org_id: str,
        profile_id: str,
        role: str,
        profile: Profile = Depends(current_profile)) -> list[ResolvedOrgRef]:
    """Create a new role for an organization"""
    with get_session() as session:
        org_seq = org_id_to_seq(org_id)
        profile_seq = profile_id_to_seq(profile_id)
        resolve_and_validate(session, profile, org_seq, roles.org_add_role)

        session.exec(insert(OrgRef).values(
            org_seq=org_seq, profile_seq=profile_seq, role=role, author_seq=profile.profile_seq))
        session.commit()

        return resolve_org_refs(
            session,
            session.exec(select(OrgRef).where(OrgRef.org_seq == org_seq)).all())


@router.delete('/{org_id}/roles/{profile_id}/{role}')
async def remove_role_from_org(
        org_id: str,
        profile_id: str,
        role: str,
        profile=Depends(current_profile)) -> list[ResolvedOrgRef]:
    """Delete a role from an organization"""
    with get_session() as session:
        org_seq = org_id_to_seq(org_id)
        profile_seq = profile_id_to_seq(profile_id)
        resolve_and_validate(session, profile, org_seq, roles.org_remove_role)
        session.exec(delete(OrgRef).where(
            OrgRef.org_seq == org_seq, OrgRef.profile_seq == profile_seq, OrgRef.role == role))
        session.commit()

        return resolve_org_refs(
            session,
            session.exec(select(OrgRef).where(OrgRef.org_seq == org_seq)).all())
