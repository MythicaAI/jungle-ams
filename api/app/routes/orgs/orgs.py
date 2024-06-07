import logging
from datetime import datetime, timezone
from http import HTTPStatus
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError, BaseModel

from auth.data import resolve_profile, resolve_roles
from auth.generate_token import generate_token
from config import app_config
from db.schema.profiles import Profile, ProfileSession, Org, OrgRef
from db.connection import get_session
from sqlmodel import select, update, delete, insert
from sqlalchemy.sql.functions import now as sql_now
from routes.authorization import current_profile, validate_roles


class OrgCreateRequest(BaseModel):
    name: str
    description: str


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


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_org(
        create: OrgCreateRequest,
        profile: Profile = Depends(current_profile)
) -> OrgCreateResponse:
    with get_session() as session:
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
    with get_session(echo=True) as session:
        org = session.exec(select(Org).where(Org.id == org_id)).first()
        if org is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"org: {org_id} not found")

        profile = resolve_profile(session, profile)
        roles = resolve_roles(session, profile, org.id)
        if not validate_roles(profile, 'update_org', roles):
            raise HTTPException(HTTPStatus.FORBIDDEN, detail=f"no valid roles in {roles}")

        r = session.exec(update(Org).where(
            Org.id == org_id).values(
            **req.model_dump(), updated=sql_now()))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, f"update for: {org_id} failed")
        session.commit()
        session.refresh(org)
        return org


@router.get('/{org_id}')
async def get_org(org_id: UUID) -> Org:
    with get_session() as session:
        org = session.exec(select(Org).where(Org.id == org_id)).first()
        return org


@router.get('/{org_id}/refs')
async def get_org_ref(org_id: UUID) -> list[OrgRef]:
    with get_session() as session:
        return session.exec(select(OrgRef).where(OrgRef.org_id == org_id)).all()


@router.post('/{org_id}/refs/{profile_id}/{role}', status_code=HTTPStatus.CREATED)
async def create_org_ref(
        org_id: UUID,
        profile_id: UUID,
        role: str,
        profile: Profile = Depends(current_profile)) -> list[OrgRef]:
    with get_session() as session:
        # role validation
        profile = resolve_profile(session, profile)
        roles = resolve_roles(session, profile, org_id)
        if not validate_roles(profile, 'create_org_ref', roles):
            raise HTTPException(HTTPStatus.FORBIDDEN, detail=f"no valid roles in {roles}")

        session.exec(insert(OrgRef).values(
            org_id=org_id, profile_id=profile_id, role=role, created_by=profile.id))
        session.commit()

        return session.exec(select(OrgRef).where(OrgRef.org_id == org_id)).all()


@router.delete('/{org_id}/refs/{profile_id}/{role}')
async def delete_org_ref(
        org_id: UUID,
        profile_id: UUID,
        role: str,
        profile=Depends(current_profile)) -> list[OrgRef]:
    with get_session() as session:
        # role validation
        profile = resolve_profile(session, profile)
        roles = resolve_roles(session, profile, org_id)
        if not validate_roles(profile, 'delete_org_ref', roles):
            raise HTTPException(HTTPStatus.FORBIDDEN, detail=f"no valid roles in {roles}")

        session.exec(delete(OrgRef).where(
            OrgRef.org_id==org_id, OrgRef.profile_id==profile_id, OrgRef.role==role))
        session.commit()

        return session.exec(select(OrgRef).where(OrgRef.org_id == org_id)).all()
