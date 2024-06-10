from http import HTTPStatus
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import auth.roles as roles
from auth.data import resolve_profile, resolve_roles
from db.schema.profiles import Profile, Org, OrgRef
from db.connection import get_session
from sqlmodel import Session, select, update, delete, insert
from sqlalchemy.sql.functions import now as sql_now
from routes.authorization import current_profile
from auth.authorization import validate_roles


class OrgCreateRequest(BaseModel):
    name: str
    description: str | None = None


class OrgCreateResponse(BaseModel):
    org: Org
    admin: OrgRef


class OrgUpdateRequest(BaseModel):
    name: str
    description: str | None = None


class OrgAddRoleRequest(BaseModel):
    org_id: UUID
    profile_id: UUID
    role: str


class OrgRemoveRoleRequest(BaseModel):
    org_id: UUID
    profile_id: UUID
    role: str


router = APIRouter(prefix="/orgs", tags=["orgs"])


def resolve_and_validate(session: Session, profile: Profile, org_id: UUID, required_role: str):
    # role validation
    profile = resolve_profile(session, profile)
    profile_roles = resolve_roles(session, profile, org_id)
    if not validate_roles(required_role, profile_roles):
        raise HTTPException(HTTPStatus.FORBIDDEN, detail=f"no valid roles in {profile_roles}")
    pass


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
        admin = OrgRef(org_id=org.id, profile_id=profile.id, role='admin', created_by=profile.id)
        session.add(admin)
        session.commit()
        session.refresh(admin)
        session.refresh(org)

        return OrgCreateResponse(org=Org(**org.model_dump()), admin=OrgRef(**admin.model_dump()))


@router.post('/{org_id}')
async def update_org(
        org_id: UUID,
        req: OrgUpdateRequest,
        profile: Profile = Depends(current_profile)
) -> Org:
    """Update an existing organization"""
    with get_session(echo=True) as session:
        org = session.exec(select(Org).where(Org.id == org_id)).first()
        if org is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"org: {org_id} not found")

        resolve_and_validate(session, profile, org_id, roles.org_update)

        r = session.exec(update(Org).where(
            Org.id == org_id).values(
            **req.model_dump(), updated=sql_now()))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, f"update for: {org_id} failed")
        session.commit()
        session.refresh(org)
        return org


@router.delete('/{org_id}')
async def delete_org(org_id: UUID, profile: Profile = Depends(current_profile)):
    """Removes an existing organization"""
    with get_session() as session:
        resolve_and_validate(session, profile, org_id, roles.org_delete)
        session.exec(update(Org).where(
            Org.id == org_id).values(
            deleted=sql_now()))


@router.get('/{org_id}')
async def get_org(org_id: UUID) -> Org:
    """Get organization by ID"""
    with get_session() as session:
        org = session.exec(select(Org).where(Org.id == org_id)).first()
        return org


@router.get('/{org_id}/roles')
async def get_org_roles(org_id: UUID) -> list[OrgRef]:
    """Get all the roles in the organization """
    with get_session() as session:
        return session.exec(select(OrgRef).where(OrgRef.org_id == org_id)).all()


@router.post('/{org_id}/roles/{profile_id}/{role}', status_code=HTTPStatus.CREATED)
async def add_role_to_org(
        org_id: UUID,
        profile_id: UUID,
        role: str,
        profile: Profile = Depends(current_profile)) -> list[OrgRef]:
    """Create a new role for an organization"""
    with get_session() as session:
        resolve_and_validate(session, profile, org_id, roles.org_add_role)

        session.exec(insert(OrgRef).values(
            org_id=org_id, profile_id=profile_id, role=role, created_by=profile.id))
        session.commit()

        return session.exec(select(OrgRef).where(OrgRef.org_id == org_id)).all()


@router.delete('/{org_id}/roles/{profile_id}/{role}')
async def remove_role_from_org(
        org_id: UUID,
        profile_id: UUID,
        role: str,
        profile=Depends(current_profile)) -> list[OrgRef]:
    """Delete a role from an organization"""
    with get_session() as session:
        resolve_and_validate(session, profile, org_id, roles.org_remove_role)
        session.exec(delete(OrgRef).where(
            OrgRef.org_id == org_id, OrgRef.profile_id == profile_id, OrgRef.role == role))
        session.commit()

        return session.exec(select(OrgRef).where(OrgRef.org_id == org_id)).all()
