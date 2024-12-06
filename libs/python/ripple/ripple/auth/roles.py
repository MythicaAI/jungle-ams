"""
Role definition module

Roles and role aliases see auth.authorization for usage of role verification
"""

#
# `Org` roles
#
org_create = 'org/create'
org_update = 'org/update'
org_delete = 'org/delete'
org_asset_create = 'org/asset/create'
org_asset_delete = 'org/asset/delete'
org_asset_update = 'org/asset/update'
org_create_role = 'org/role/create'
org_delete_role = 'org/role/delete'
org__all_roles = {
    org_create,
    org_update,
    org_delete,
    org_asset_create,
    org_asset_delete,
    org_asset_update,
    org_create_role,
    org_delete_role,
}
org__member_roles = {
    org_asset_create,
    org_asset_update,
    org_asset_delete,
}
org__mod_roles = {
    *org__member_roles,
    org_update,
    org_create_role,
    org_delete_role
}
org__edit_roles = {
    org_update,
    org_create_role,
    org_delete_role,
}

#
# `Asset` roles
#
asset_create = 'asset/create'
asset_update = 'asset/update'
asset_delete = 'asset/delete'
asset__all_roles = {
    asset_create,
    asset_update,
    asset_delete,
}
asset__edit_roles = {
    asset_update,
    asset_delete,
}

#
# `Profile` roles
#
profile_update = 'profile/update'
profile_delete = 'profile/delete'
profile__all_roles = {
    profile_update,
    profile_delete,
}

#
# `Tag` roles
#
tag_create = 'tag/create'
tag_update = 'tag/update'
tag_delete = 'tag/delete'
tag__all_roles = {
    tag_create,
    tag_update,
    tag_delete,
}
tag__edit_roles = {
    tag_update,
    tag_delete
}

# Object creation roles (no scope)
core__create_roles = {
    org_create,
    asset_create,
}

# Bind all roles
all_roles = {
    *org__all_roles,
    *asset__all_roles,
    *tag__all_roles
}

# Aliases to bind profiles to specific roles
alias_org_admin = "org-admin"
alias_org_mod = "org-mod"
alias_org_member = "org-member"
alias_asset_editor = "asset-editor"
alias_profile_editor = 'profile-editor'
alias_tag_author = "tag-author"
alias_core_create = "core-create"

# marker used in the scope match of a role to indicate that it must match
# the current input scope, e.g. asset_edit must match the owner, author or org
self_object_scope = "^"

"""
Role aliases can be stored on a profile and used to validate the specific required
role of the profile.
"""
role_aliases: dict = {
    alias_tag_author: tag__all_roles,
    alias_org_admin: org__all_roles,
    alias_org_mod: org__mod_roles,
    alias_org_member: org__member_roles,
    alias_asset_editor: asset__all_roles,
    alias_profile_editor: profile__all_roles,
    alias_core_create: core__create_roles,
}

"""Allowed list of org role aliases"""
org_role_aliases = {
    alias_org_admin,
    alias_org_mod,
    alias_org_member,
}

"""When added to a profile with any scope these allow privileged access"""
privileged_roles = {
    alias_tag_author,
    alias_asset_editor,
    alias_profile_editor,
    alias_org_admin
}

"""Build reverse map to get aliases from roles"""
role_to_alias = {}
for alias, roles in role_aliases.items():
    for role in roles:
        role_to_alias.setdefault(role, set()).add(alias)
