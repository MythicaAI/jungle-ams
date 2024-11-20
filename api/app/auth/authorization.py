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
        {auth.roles.asset_update},
        Scope(asset=<current-asset>...))

"""

from http import HTTPStatus
from typing import Optional

from fastapi import HTTPException
from pydantic import BaseModel

from auth.generate_token import SessionProfile
from auth.roles import role_to_alias, self_object_scope
from cryptid.cryptid import org_seq_to_id, profile_seq_to_id
from db.schema.assets import Asset, AssetVersion
from db.schema.profiles import Org

# TODO: move to admin interface
privileged_emails = {
    'test@mythica.ai',
    'jacob@mythica.ai',
    'pedro@mythica.ai',
    'kevin@mythica.ai',
    'bohdan.krupa.mythica@gmail.com',
    'kyrylo.katkov@gmail.com',
}


class Scope(BaseModel):
    """The currently scoped objects to test against"""
    profile: Optional[SessionProfile] = None
    org: Optional[Org] = None
    asset: Optional[Asset] = None
    asset_version: Optional[AssetVersion] = None


def validate_asset_ownership_scope(
        role: str,
        auth_roles: set[str],
        object_id: Optional[str] = None,
        scope: Optional[Scope] = None,
        only_asset: bool = False) -> bool:
    """Internally validate the roles against the asset ownership logic"""

    # without an asset in the scope, the role check will succeed
    # e.g. asset/create
    if scope is None or scope.asset is None:
        return True

    # testing asset roles requires the asset_version to be provided
    if not only_asset and scope.asset_version is None:
        raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                            f'{role} missing asset_version scope')

    # The profile is the owner of the asset or author of the version
    if scope.profile and \
            (scope.asset.owner_seq == scope.profile.profile_seq or
                not only_asset and scope.asset_version.author_seq == scope.profile.profile_seq):
        return True

    # Look for a org scoped role by alias on the profile
    # e.g. org-member or org-admin (depending on test.role check)
    if scope.asset.org_seq:
        org_scope_rule = f'org/{role}'
        org_id = org_seq_to_id(scope.asset.org_seq)
        aliases_for_role = role_to_alias.get(org_scope_rule)
        if aliases_for_role is None:
            raise HTTPException(HTTPStatus.UNAUTHORIZED,
                                f'{role} does not map to any aliases')
        for alias in aliases_for_role:
            test_scoped_role = f'{alias}:{org_id}'
            if test_scoped_role in auth_roles:
                return True

    # Asset scope checks failed
    raise HTTPException(HTTPStatus.UNAUTHORIZED,
                        f'{role} role unauthorized for asset {object_id}')


def validate_roles(
        *,
        role: str,
        auth_roles: set[str],
        object_id: Optional[str] = None,
        scope: Optional[Scope] = None,
        **kwargs) -> bool:
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
        alias_object = f'{alias}:{object_id}'
        if alias_object in auth_roles:
            return True

        # self scope matching: alias:^
        # e.g. asset-editor:^  matching against asset/asset_edit:ownership
        self_scope_alias = f'{alias}:{self_object_scope}'
        if self_scope_alias in auth_roles:
            if role.startswith('asset/'):
                return validate_asset_ownership_scope(role, auth_roles, object_id, scope, **kwargs)
            elif role.startswith('profile/'):
                if scope.profile and \
                        object_id == profile_seq_to_id(scope.profile.profile_seq):
                    return True
                raise HTTPException(HTTPStatus.UNAUTHORIZED,
                                    f'{role} profile mismatch')
            else:
                raise HTTPException(HTTPStatus.UNAUTHORIZED,
                                    f'{role}, scope matching not available')

    # Exit case will always raise
    raise HTTPException(
        HTTPStatus.UNAUTHORIZED,
        f'{role} not satisfied by {auth_roles}"')
