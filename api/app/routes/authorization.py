from http import HTTPStatus
from http.client import HTTPException

from fastapi import Header
from auth.data import get_profile
from db.schema.profiles import Profile


async def current_profile(authorization: str = Header("Authorization")) -> Profile:
    return get_profile(authorization)


OPS = {
    'create_org',
    'update_org'
    'create_asset',
    'update_asset',
    'create_asset_version'
    'update_asset_version'
}


def allow(ctx: dict) -> bool:
    return True


def deny(ctx: dict) -> bool:
    return False


AUTHORIZE: dict = {
    ('create_org', 'admin'): allow,
    ('update_org', 'admin'): allow,
    ('create_org_ref', 'admin'): allow,
    ('delete_org_ref', 'admin'): allow,
}


async def role_allowed_to(op: str, role: str, context: dict) -> bool:
    assert op in OPS
    f = AUTHORIZE.get((op, role))
    if f is None:
        raise HTTPException(HTTPStatus.BAD_REQUEST, f'Invalid op:role "{op} {role}"')
    return f(context)


async def validate_roles(profile: Profile, op: str, roles: set[str]) -> bool:
    context = {'profile': profile}
    for role in roles:
        if role_allowed_to(op, role, context):
            return True
    return False
