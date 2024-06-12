from http import HTTPStatus
from fastapi import HTTPException

import auth.roles as roles


role_aliases: dict = {
    'admin': '*',
    'mod': { roles.org_update, roles.org_add_role, roles.org_remove_role, roles.asset_create, roles.asset_update },
    'user': { roles.asset_create, roles.asset_update }
}


def validate_roles(required_role: str, roles: set[str]) -> bool:
    """Validate that the required role is satisfied by the given role set."""
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