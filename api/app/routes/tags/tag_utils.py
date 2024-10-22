"""Utils for tags"""

from http import HTTPStatus

from fastapi import HTTPException
from sqlmodel import Session


from auth.authorization import validate_roles
from auth.data import resolve_profile, resolve_roles_by_org_name
from db.schema.profiles import Profile


def resolve_and_validate_role_by_org_name(
    session: Session, profile: Profile, required_role: str, org_name="mythica"
) -> None:
    """
    Resolve the profile and roles across all organizations,
    then validate if the profile has the `required_role` in any organization.
    """
    profile = resolve_profile(session, profile)
    all_profile_roles = resolve_roles_by_org_name(session, profile, org_name)

    if not validate_roles(required_role, all_profile_roles):
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail=f"Profile does not have the required role: '{required_role}'.",
        )
