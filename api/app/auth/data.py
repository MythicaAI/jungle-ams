import logging
from http import HTTPStatus

from fastapi import HTTPException
from sqlmodel import Session, select

from auth.generate_token import decode_token
from db.schema.profiles import Org, OrgRef, Profile

log = logging.getLogger(__name__)


def get_bearer_token(authorization: str) -> str:
    """Get the bearer token from the authorization header"""
    if not authorization:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail='Authorization header missing')
    auth_parts = authorization.split(' ')
    if len(auth_parts) != 2 or not auth_parts[0] == 'Bearer':
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, detail=f'Invalid Authorization header "{authorization}"')
    return auth_parts[1]


def get_profile(authorization: str) -> Profile:
    """Given an auth bearer header value, return a Profile object"""
    profile, _ = decode_token(get_bearer_token(authorization))
    return profile


def get_profile_roles(authorization: str) -> (Profile, list[str]):
    """Get the current authorized profile and it's roles from the bearer token"""
    return decode_token(get_bearer_token(authorization))


def resolve_profile(session, profile: Profile) -> Profile:
    resolved_profile = session.exec(
        select(Profile).where(Profile.profile_seq == profile.profile_seq)).first()
    if resolved_profile is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail=f'Profile {profile.profile_id} not found')
    return resolved_profile


def resolve_roles(session: Session, profile_seq: int, org_seq: int = None) -> set[str]:
    """Get the set of roles for a profile in an org"""
    if org_seq is not None:
        org_refs = session.exec(select(OrgRef).where(
            OrgRef.org_seq == org_seq, OrgRef.profile_seq == profile_seq)).all()
    else:
        org_refs = session.exec(select(OrgRef).where(
            OrgRef.profile_seq == profile_seq)).all()
    return {o.role for o in org_refs}


def resolve_roles_by_org_name(session: Session, profile_seq: int, org_name: str) -> set[str]:
    """Get the set of roles for a profile in an org"""
    subquery = select(Org).where(Org.name == org_name).subquery()
    org_refs = session.exec(select(OrgRef).join(
        subquery, subquery.c.org_seq == OrgRef.org_seq
    ).where(
        OrgRef.profile_seq == profile_seq
    )
    ).all()
    return {o.role for o in org_refs}


def get_or_create_org(session: Session, org_name: str, profile_seq: int) -> Org:
    """Retrieve an organization by exact name or create a new one for the user"""
    existing_org = session.execute(
        select(Org).where(Org.name == org_name)
    ).scalars().first()

    if existing_org:
        return existing_org

    new_org = Org(
        profile_seq=profile_seq,
        name=org_name,
        description=org_name
    )
    session.add(new_org)
    session.commit()
    session.refresh(new_org)

    return new_org


def get_or_create_org_ref(session: Session, org: Org, profile: Profile, role: str):
    """
    Check if OrgRef exists, otherwise place an object into this session.
    NOTE: There is no Session.commit().
    """

    # Check if an OrgRef with the same org_seq, profile_seq, and role already exists
    existing_entry = session.exec(select(OrgRef).filter_by(
        org_seq=org.org_seq,
        profile_seq=profile.profile_seq,
        role=role)).first()

    if not existing_entry:
        # If not found, create a new OrgRef entry
        new_org_entry = OrgRef(
            org_seq=org.org_seq,
            profile_seq=profile.profile_seq,
            role=role,
            author_seq=profile.profile_seq,
        )
        session.add(new_org_entry)
        log.warning("Created a new OrgRef:%s entry for profile_seq: %s", role, profile.profile_seq)
    else:
        log.info("OrgRef entry already exists for profile_seq: %s", profile.profile_seq)


def create_new_org_ref_to_profile_roles(session: Session, org_name: str, profiles: list[Profile], role: str):
    org = get_or_create_org(session, org_name, profiles[0])

    for profile in profiles:
        get_or_create_org_ref(session, org, profile, role)

    session.commit()
