import logging
from http import HTTPStatus

from fastapi import HTTPException
from jwt import DecodeError, InvalidTokenError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from db.schema.profiles import OrgRef
from meshwork.auth.generate_token import SessionProfile, decode_token

log = logging.getLogger(__name__)


def get_bearer_token(authorization: str) -> str:
    """Get the bearer token from the authorization header"""
    if not authorization:
        raise HTTPException(HTTPStatus.BAD_REQUEST,
                            detail='Authorization header missing')
    auth_parts = authorization.split(' ')
    if len(auth_parts) != 2 or not auth_parts[0] == 'Bearer':
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, detail='Authorization must be a Bearer token')
    return auth_parts[1]


def decode_session_profile(authorization: str) -> SessionProfile:
    """Given an auth bearer header value, return a Profile object"""
    try:
        return decode_token(get_bearer_token(authorization))
    except (DecodeError, InvalidTokenError) as exc:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, detail='Invalid authorization token') from exc


async def resolve_org_roles(db_session: AsyncSession, profile_seq: int, org_seq: int = None) -> set[str]:
    """Get the set of roles for a profile in an org"""
    if org_seq is not None:
        org_refs = (await db_session.exec(select(OrgRef).where(
            OrgRef.org_seq == org_seq, OrgRef.profile_seq == profile_seq))).all()
    else:
        org_refs = (await db_session.exec(select(OrgRef).where(
            OrgRef.profile_seq == profile_seq))).all()
    return {o.role for o in org_refs}
