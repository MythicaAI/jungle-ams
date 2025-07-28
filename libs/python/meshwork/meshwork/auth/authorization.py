"""
Role based action authorization

subject:

Profiles can have roles or have aliases that provide roles with special bindings
   implicit:
     @mythica.ai -> tag-author

    org/add_member

        <role>      :<scope>    <role>     <role>
    A org/add_member:org_X,   asset_edit, asset_create
    C org/add_member

    validate_roles(
        Test(role=org/add_member, object_id=org_X),
        {roles.asset_update},
        Scope(asset=<current-asset>...))

"""

from typing import Optional

from pydantic import BaseModel
from meshwork.auth.roles import role_to_alias, self_object_scope
from meshwork.models.assets import AssetVersionRef
from meshwork.models.sessions import OrgRef, SessionProfile
from meshwork.models.streaming import JobDefinition

# TODO: move to admin interface
privileged_emails = {
    "test@mythica.ai",
    "jacob@mythica.ai",
    "pedro@mythica.ai",
    "kevin@mythica.ai",
    "bohdan.krupa.mythica@gmail.com",
    "kyrylo.katkov@gmail.com",
}


class RoleError(Exception):
    """Raised when a role check fails"""

    def __init__(self, message: str):
        self.message = message


class Scope(BaseModel):
    """The currently scoped objects to test against"""

    profile: Optional[SessionProfile] = None
    org: Optional[OrgRef] = None
    asset_version: Optional[AssetVersionRef] = None
    job_def: Optional[JobDefinition] = None


def check_asset_version_role(
    role: str, auth_roles: set[str], scope: Optional[Scope] = None
) -> bool:
    """Internally validate the roles against the asset ownership logic"""
    if scope.asset_version is None:
        return False

    # The profile is the owner of the asset or author of the version
    if scope.profile and (
        scope.asset_version.owner_id == scope.profile.profile_id
        or scope.asset_version.author_id == scope.profile.profile_id
    ):
        return True

    # Look for a org scoped role by alias on the profile
    # e.g. org-member or org-admin (depending on test.role check)
    if scope.asset_version.org_id:
        org_scope_rule = f"org/{role}"
        org_id = scope.asset_version.org_id
        aliases_for_role = role_to_alias.get(org_scope_rule, [])
        for alias in aliases_for_role:
            test_scoped_role = f"{alias}:{org_id}"
            if test_scoped_role in auth_roles:
                return True

    # Asset scope checks failed
    return False


def check_job_def_role(scope: Optional[Scope] = None, **kwargs) -> bool:
    """Internally validate the roles against the job_def ownership logic"""
    if scope.job_def is None:
        return False

    if kwargs.get("is_canary", False) and scope.job_def.owner_id is None:
        return True

    # The profile is the owner of the job_def
    if scope.profile and (scope.job_def.owner_id == scope.profile.profile_id):
        return True
    # job_def scope checks failed
    return False


def validate_roles(
    *,
    role: str,
    auth_roles: set[str],
    object_id: Optional[str] = None,
    scope: Optional[Scope] = None,
    **kwargs,
) -> bool:
    """
    Validate that the required role is satisfied by the given role set.
    """
    #
    # Simple case, the profile roles satisfy the test.role exactly
    #
    # e.g.: actions validated against global rules such as tag-author
    #
    if role in auth_roles:
        return True

    #
    # Find the aliases that can satisfy the role, match against aliases
    # provided by the profile.
    #
    aliases_for_role = role_to_alias.get(role, [])
    for alias in aliases_for_role:
        # cases such as global org-admin matching against org/add_asset or asset/update
        if alias in auth_roles:
            return True

        # alias:object matching, profile has role on object ID, no extra scope
        # matching required
        # e.g. org-member:org_123
        alias_object = f"{alias}:{object_id}"
        if alias_object in auth_roles:
            return True

        # self scope matching: alias:^
        # e.g. asset-editor:^  matching against asset/asset_edit:ownership
        self_scope_alias = f"{alias}:{self_object_scope}"
        if self_scope_alias in auth_roles:
            if role.startswith("asset/") and check_asset_version_role(
                role, auth_roles, scope
            ):
                return True
            elif role.startswith("profile/"):
                if scope.profile and object_id == scope.profile.profile_id:
                    return True
            elif role.startswith("job_def/") and check_job_def_role(scope, **kwargs):
                return True

    # Exit case will always raise
    raise RoleError(f'{role} not satisfied by {auth_roles}"')
