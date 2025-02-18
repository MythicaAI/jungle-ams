"""APIs for working with organization objects and their relations"""

from datetime import datetime
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, constr
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import col, delete as sql_delete, insert, select, update as sql_update
from sqlmodel.ext.asyncio.session import AsyncSession

from cryptid.cryptid import org_id_to_seq, org_seq_to_id, profile_id_to_seq, profile_seq_to_id
from db.connection import get_db_session
from db.schema.profiles import Org, OrgRef, Profile
from profiles.invalidate_sessions import invalidate_sessions
from ripple.auth import roles
from ripple.auth.authorization import validate_roles
from ripple.models.sessions import SessionProfile
from routes.authorization import session_profile

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


async def resolve_org_refs(
        db_session: AsyncSession,
        refs: list[OrgRef]) -> list[OrgRefResponse]:
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
                  (await db_session.exec(select(Org).where(col(Org.org_seq).in_(org_seqs)))).all()}
    profiles_by_id = {profile_seq_to_id(profile.profile_seq): profile for profile in
                      (await db_session.exec(select(Profile).where(col(Profile.profile_seq).in_(profile_seqs)))).all()}
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
async def create(
        create_req: OrgCreateRequest,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)
) -> OrgRefResponse:
    """Create a new organization, the creating profile will be an admin"""
    # create the org
    org = Org(**create_req.model_dump())
    db_session.add(org)
    await db_session.commit()
    await db_session.refresh(org)

    # create the admin from the profile
    admin = OrgRef(org_seq=org.org_seq,
                   profile_seq=profile.profile_seq,
                   role=roles.alias_org_admin,
                   author_seq=profile.profile_seq)
    db_session.add(admin)
    await invalidate_sessions(db_session, profile.profile_seq)
    await db_session.commit()
    await db_session.refresh(admin)

    resolved = await resolve_org_refs(db_session, [admin])
    assert len(resolved) == 1
    return resolved[0]


@router.get('/named/{org_name}')
async def by_name(
        org_name: org_name_str,
        exact_match: Optional[bool] = True,
        db_session: AsyncSession = Depends(get_db_session)) -> list[OrgResponse]:
    """Get organization by name"""
    if exact_match:
        # pylint: disable=no-member
        db_results = (await db_session.exec(select(Org).where(
            Org.name == org_name))).all()
    else:
        # pylint: disable=no-member,unexpected-type
        db_results = (await db_session.exec(select(Org).where(
            col(Org.name).contains(org_name)))).all()
    results = [OrgResponse(**r.model_dump(), org_id=org_seq_to_id(r.org_seq))
               for r in db_results]
    return results


@router.post('/{org_id}')
async def update(
        org_id: str,
        req: OrgUpdateRequest,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)
) -> OrgResponse:
    """Update an existing organization"""
    org_seq = org_id_to_seq(org_id)
    org = (await db_session.exec(select(Org).where(Org.org_seq == org_seq))).first()
    if org is None:
        raise HTTPException(HTTPStatus.NOT_FOUND,
                            f"org: {org_id} not found")

    validate_roles(role=roles.org_update, object_id=org_id, auth_roles=profile.auth_roles)

    r = await db_session.exec(sql_update(Org).where(
        Org.org_seq == org_seq).values(
        **req.model_dump(), updated=sql_now()))
    if r.rowcount == 0:
        raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                            f"update for: {org_id} failed")
    await db_session.commit()
    await db_session.refresh(org)
    result = OrgResponse(org_id=org_seq_to_id(org.org_seq),
                         **org.model_dump())
    return result


@router.delete('/{org_id}')
async def delete(
        org_id: str,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)):
    """Removes an existing organization"""
    org_seq = org_id_to_seq(org_id)
    validate_roles(role=roles.org_delete, object_id=org_id, auth_roles=profile.auth_roles)

    await db_session.exec(sql_update(Org).where(
        Org.org_seq == org_seq).values(
        deleted=sql_now()))
    await invalidate_sessions(db_session, profile.profile_seq)
    await db_session.commit()


@router.get('/')
async def member_of(
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> list[OrgRefResponse]:
    """Default get returns roles for the requesting profile"""
    refs = (await db_session.exec(select(OrgRef)
                                  .where(OrgRef.profile_seq == profile.profile_seq))
            ).all()
    return await resolve_org_refs(db_session, refs)


@router.get('/{org_id}')
async def by_id(
        org_id: str = None,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> OrgResponse:
    """Get organization by ID"""
    org_seq = org_id_to_seq(org_id)
    if org_id is None:
        if profile is None:
            raise HTTPException(HTTPStatus.FORBIDDEN,
                                detail="no valid profile")
        return (await db_session.exec(select(OrgRef)
                                      .where(OrgRef.profile_seq == profile.profile_seq)
                                      )).all()
    org = (await db_session.exec(select(Org).where(Org.org_seq == org_seq))).first()
    return OrgResponse(**org.model_dump(), org_id=org_seq_to_id(org.org_seq))


@router.get('/{org_id}/roles')
async def member_roles(
        org_id: str,
        db_session: AsyncSession = Depends(get_db_session)) -> list[OrgRefResponse]:
    """Get all the roles in the organization """
    org_seq = org_id_to_seq(org_id)
    return await resolve_org_refs(
        db_session,
        (await db_session.exec(select(OrgRef).where(OrgRef.org_seq == org_seq))).all())


@router.post('/{org_id}/roles/{profile_id}/{role}', status_code=HTTPStatus.CREATED)
async def add_role(
        org_id: str,
        profile_id: str,
        role: str,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> list[OrgRefResponse]:
    """Create a new role for an organization"""
    org_seq = org_id_to_seq(org_id)
    profile_seq = profile_id_to_seq(profile_id)
    validate_roles(role=roles.org_create_role, object_id=org_id, auth_roles=profile.auth_roles)

    if role not in roles.org_role_aliases:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail=f"org role must be one of {roles.org_role_aliases}")

    await db_session.exec(insert(OrgRef).values(
        org_seq=org_seq,
        profile_seq=profile_seq,
        role=role,
        author_seq=profile.profile_seq))
    await invalidate_sessions(db_session, profile_seq)
    await db_session.commit()

    return await resolve_org_refs(
        db_session,
        (await db_session.exec(select(OrgRef).where(
            OrgRef.org_seq == org_seq))).all())


@router.delete('/{org_id}/roles/{profile_id}/{role}')
async def remove_role(
        org_id: str,
        profile_id: str,
        role: str,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> list[OrgRefResponse]:
    """Delete a role from an organization"""
    org_seq = org_id_to_seq(org_id)
    profile_seq = profile_id_to_seq(profile_id)
    validate_roles(role=roles.org_delete_role, object_id=org_id, auth_roles=profile.auth_roles)

    await db_session.exec(sql_delete(OrgRef).where(
        OrgRef.org_seq == org_seq,
        OrgRef.profile_seq == profile_seq,
        OrgRef.role == role))
    await invalidate_sessions(db_session, profile_seq)
    await db_session.commit()

    return await resolve_org_refs(
        db_session,
        (await db_session.exec(select(OrgRef).where(OrgRef.org_seq == org_seq))).all())
