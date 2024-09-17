from http import HTTPStatus

from fastapi import HTTPException
from sqlmodel import Session, select

from auth.cookie import cookie_to_profile
from auth.generate_token import validate_token
from db.schema.profiles import Profile, OrgRef


def get_profile(authorization: str) -> Profile:
    """Given an auth bearer header value, return a Profile object"""
    if not authorization:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail='Authorization header missing')

    auth_parts = authorization.split(' ')
    if len(auth_parts) != 2 or not auth_parts[0] == 'Bearer':
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, detail=f'Invalid Authorization header "{authorization}"')

    if not validate_token(auth_parts[1]):
        raise HTTPException(HTTPStatus.UNAUTHORIZED, detail='Invalid token')

    cookie_data = auth_parts[1].split(':')[0]
    profile = cookie_to_profile(cookie_data)
    return profile


def resolve_profile(session, profile: Profile) -> Profile:
    resolved_profile = session.exec(
        select(Profile).where(Profile.profile_seq == profile.profile_seq)).first()
    if resolved_profile is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail=f'Profile {profile.profile_id} not found')
    return resolved_profile


def resolve_roles(session: Session, profile: Profile, org_seq: int) -> set[str]:
    """Get the set of roles for a profile in an org"""
    org_refs = session.exec(select(OrgRef).where(
        OrgRef.org_seq == org_seq, OrgRef.profile_seq == profile.profile_seq)).all()
    return {o.role for o in org_refs}
