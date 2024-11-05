"""APIs for working with organization objects and their relations"""

from datetime import datetime
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, constr
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import Session, col, delete, insert, select, update

import auth.roles
from auth.authorization import Test, validate_roles
from auth.data import resolve_profile, resolve_roles
from cryptid.cryptid import org_id_to_seq, org_seq_to_id, profile_id_to_seq, profile_seq_to_id
from db.connection import get_session
from db.schema.profiles import Org, OrgRef, Profile
from profiles.invalidate_sessions import invalidate_sessions
from routes.authorization import session_profile, session_profile_roles

MIN_ORG_NAME = 3
MAX_ORG_NAME = 64
org_name_str = constr(strip_whitespace=True, min_length=MIN_ORG_NAME, max_length=MAX_ORG_NAME)


class OrgCreateRequest(BaseModel):
    name: org_name_str
    description: str | None = None


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


class OrgRefResponse(BaseModel):
    org_id: str
    org_name: str
    profile_id: str
    profile_name: str
    role: str
    author_id: str
    author_name: str
    description: str | None = None
    created: datetime


class OrgResponse(BaseModel):
    org_id: str
    name: str
    description: str | None = None
    created: datetime | None = None


router = APIRouter(prefix="/orgs", tags=["orgs"])


def resolve_and_validate(session: Session, profile: Profile, org_seq: int, required_role: str):
    """Resolve profile, roles and validate against `required_role`"""
    # role validation
    profile = resolve_profile(session, profile)
    profile_roles = resolve_roles(session, profile.profile_seq, org_seq)
    if not validate_roles(required_role, profile_roles):
        raise HTTPException(HTTPStatus.FORBIDDEN,
                            detail=f"no valid roles in {profile_roles}")


def resolve_org_refs(session: Session, refs: list[OrgRef]) -> list[OrgRefResponse]:
    """Given a list of refs, return the resolved reference with extra data present"""
    org_seqs = set()
    profile_seqs = set()
    for ref in refs:
        org_seqs.add(ref.org_seq)
        profile_seqs.add(ref.profile_seq)
        profile_seqs.add(ref.author_seq)

    # use org_seq and profile_seq sets to resolve these objects allowing
    # names to be resolved
    # pylint: disable=no-member
    orgs_by_id = {org_seq_to_id(org.org_seq): org for org in
                  session.exec(select(Org).where(col(Org.org_seq).in_(org_seqs))).all()}
    profiles_by_id = {profile_seq_to_id(profile.profile_seq): profile for profile in
                      session.exec(select(Profile).where(col(Profile.profile_seq).in_(profile_seqs))).all()}
    results = list()
    for ref in refs:
        org_id = org_seq_to_id(ref.org_seq)
        profile_id = profile_seq_to_id(ref.profile_seq)
        author_id = profile_seq_to_id(ref.author_seq)
        org = orgs_by_id[org_id]
        profile = profiles_by_id[profile_id]
        author = profiles_by_id[author_id]
        results.append(OrgRefResponse(org_id=org_id,
                                      org_name=org.name,
                                      profile_id=profile_id,
                                      profile_name=profile.name,
                                      role=ref.role,
                                      author_id=author_id,
                                      author_name=author.name,
                                      description=org.description,
                                      created=ref.created))
    return results


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_org(
        create: OrgCreateRequest,
        profile: Profile = Depends(session_profile)
) -> OrgRefResponse:
    """Create a new organization, the creating profile will be an admin"""
    with get_session() as session:
        # create the org
        org = Org(**create.model_dump())
        session.add(org)
        session.commit()
        session.refresh(org)

        # create the admin from the profile
        admin = OrgRef(org_seq=org.org_seq,
                       profile_seq=profile.profile_seq,
                       role=auth.roles.alias_org_admin,
                       author_seq=profile.profile_seq)
        session.add(admin)
        invalidate_sessions(session, profile.profile_seq)
        session.commit()
        session.refresh(admin)

        resolved = resolve_org_refs(session, [admin])
        assert len(resolved) == 1
        return resolved[0]


@router.get('/named/{org_name}')
async def get_org_by_name(org_name: org_name_str, exact_match: Optional[bool] = True) -> list[OrgResponse]:
    """Get organization by name"""
    with get_session() as session:
        if exact_match:
            db_results = session.exec(select(Org).where(
                Org.name == org_name)).all()
        else:
            db_results = session.exec(select(Org).where(
                col(Org.name).contains(org_name))).all()  # pylint: disable=no-member
        results = [OrgResponse(**r.model_dump(), org_id=org_seq_to_id(r.org_seq))
                   for r in db_results]
        return results


@router.post('/{org_id}')
async def update_org(
        org_id: str,
        req: OrgUpdateRequest,
        profile_roles: Profile = Depends(session_profile_roles)
) -> OrgResponse:
    """Update an existing organization"""
    with get_session(echo=True) as session:
        _, roles = profile_roles
        org_seq = org_id_to_seq(org_id)
        org = session.exec(select(Org).where(Org.org_seq == org_seq)).first()
        if org is None:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                f"org: {org_id} not found")

        validate_roles(Test(role=auth.roles.org_update, object_id=org_id),
                       roles)

        r = session.exec(update(Org).where(
            Org.org_seq == org_seq).values(
            **req.model_dump(), updated=sql_now()))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                                f"update for: {org_id} failed")
        session.commit()
        session.refresh(org)
        result = OrgResponse(org_id=org_seq_to_id(org.org_seq),
                             **org.model_dump())
        return result


@router.delete('/{org_id}')
async def delete_org(org_id: str, profile_roles: Profile = Depends(session_profile_roles)):
    """Removes an existing organization"""
    with get_session() as session:
        profile, roles = profile_roles
        org_seq = org_id_to_seq(org_id)
        validate_roles(Test(role=auth.roles.org_delete, object_id=org_id),
                       roles)

        session.exec(update(Org).where(
            Org.org_seq == org_seq).values(
            deleted=sql_now()))
        invalidate_sessions(session, profile.profile_seq)
        session.commit()


@router.get('/')
async def get_org(profile: Profile = Depends(session_profile)) -> list[OrgRefResponse]:
    """Default get returns roles for the requesting profile"""
    with get_session() as session:
        return resolve_org_refs(session,
                                session.exec(select(OrgRef)
                                             .where(OrgRef.profile_seq == profile.profile_seq))
                                .all())


@router.get('/{org_id}')
async def get_org_by_id(org_id: str = None, profile: Profile = Depends(session_profile)) -> OrgResponse:
    """Get organization by ID"""
    with (get_session() as session):
        org_seq = org_id_to_seq(org_id)
        if org_id is None:
            if profile is None:
                raise HTTPException(HTTPStatus.FORBIDDEN,
                                    detail="no valid profile")
            return session.exec(select(OrgRef)
                                .where(OrgRef.profile_seq == profile.profile_seq)
                                ).all()
        org = session.exec(select(Org).where(Org.org_seq == org_seq)).first()
        return OrgResponse(**org.model_dump(), org_id=org_seq_to_id(org.org_seq))


@router.get('/{org_id}/roles')
async def get_org_roles(org_id: str) -> list[OrgRefResponse]:
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
        profile_roles: Profile = Depends(session_profile_roles)) -> list[OrgRefResponse]:
    """Create a new role for an organization"""
    with get_session() as session:
        org_seq = org_id_to_seq(org_id)
        profile_seq = profile_id_to_seq(profile_id)
        profile, roles = profile_roles
        validate_roles(Test(role=auth.roles.org_add_role, object_id=org_id),
                       roles)

        if role not in auth.roles.org_role_aliases:
            raise HTTPException(HTTPStatus.BAD_REQUEST,
                                detail=f"org role must be one of {auth.roles.org_role_aliases}")

        session.exec(insert(OrgRef).values(
            org_seq=org_seq,
            profile_seq=profile_seq,
            role=role,
            author_seq=profile.profile_seq))
        invalidate_sessions(session, profile_seq)
        session.commit()

        return resolve_org_refs(
            session,
            session.exec(select(OrgRef).where(
                OrgRef.org_seq == org_seq)).all())


@router.delete('/{org_id}/roles/{profile_id}/{role}')
async def remove_role_from_org(
        org_id: str,
        profile_id: str,
        role: str,
        profile_roles=Depends(session_profile_roles)) -> list[OrgRefResponse]:
    """Delete a role from an organization"""
    with get_session() as session:
        org_seq = org_id_to_seq(org_id)
        profile_seq = profile_id_to_seq(profile_id)
        _, roles = profile_roles
        validate_roles(Test(role=auth.roles.org_remove_role, object_id=org_id),
                       roles)

        session.exec(delete(OrgRef).where(
            OrgRef.org_seq == org_seq,
            OrgRef.profile_seq == profile_seq,
            OrgRef.role == role))
        invalidate_sessions(session, profile_seq)
        session.commit()

        return resolve_org_refs(
            session,
            session.exec(select(OrgRef).where(OrgRef.org_seq == org_seq)).all())
