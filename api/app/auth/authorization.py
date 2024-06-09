from http import HTTPStatus

from auth import roles
from db.schema.profiles import Profile
import auth.roles as roles
from fastapi import HTTPException


role_aliases: dict = {
    'admin': '*',
    'mod': { roles.org_update, roles.org_add_role, roles.org_remove_role, roles.asset_create, roles.asset_update },
    'user': { roles.asset_create, roles.asset_update }
}


def validate_roles(required_role: str, roles: set[str]) -> bool:
    if required_role in roles:
        return True
    for role in roles:
        if role == required_role:
            return True
        aliases = role_aliases.get(role, set())
        if '*' in aliases:
            return True
        if required_role in aliases:
            return True

    raise HTTPException(HTTPStatus.BAD_REQUEST, f'no role for {required_role} {roles}"')