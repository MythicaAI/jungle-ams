import pytest
from fastapi import HTTPException

import auth.roles
from auth.authorization import Scope, Test, validate_roles
from cryptid.cryptid import asset_seq_to_id, org_seq_to_id
from db.schema.assets import Asset, AssetVersion
from db.schema.profiles import Profile

org_a_seq = 5
org_b_seq = 6
asset_a_seq = 15
asset_a_owner_seq = 25
asset_a_author_seq = 25
asset_b_seq = 16
asset_b_owner_seq = 26
asset_b_author_seq = 27
superuser_seq = 1000

org_a = org_seq_to_id(org_a_seq)
org_b = org_seq_to_id(org_b_seq)
asset_a = asset_seq_to_id(asset_a_seq)
asset_b = asset_seq_to_id(asset_b_seq)

# admin of organization A
org_a_admin = {
    f'{auth.roles.alias_org_admin}:{org_a}',
    f'{auth.roles.alias_asset_editor}:{auth.roles.self_object_scope}'
}

# member of organization A
org_a_member = {
    f'{auth.roles.alias_org_member}:{org_a}',
    f'{auth.roles.alias_asset_editor}:{auth.roles.self_object_scope}'
}

# admin of organization B
org_b_admin = {
    f'{auth.roles.alias_org_admin}:{org_b}',
    f'{auth.roles.alias_asset_editor}:{auth.roles.self_object_scope}'
}

# a superuser (Mythica employee)
# has tag-authoring
# org-admin (global)
# asset-editor (global)
superuser = {
    auth.roles.alias_tag_author,
    auth.roles.alias_org_admin,
    auth.roles.alias_asset_editor,
}


def test_org_add_role():
    # validate admin of object_a can add role
    assert validate_roles(
        Test(object_id=org_a, role=auth.roles.org_add_role),
        org_a_admin)

    # validate other admin cannot add roles to org_a
    with pytest.raises(HTTPException):
        validate_roles(
            Test(object_id=org_a, role=auth.roles.org_add_role),
            org_b_admin)

    # validate user of org_a can not add role to same group
    with pytest.raises(HTTPException):
        validate_roles(
            Test(object_id=org_a, role=auth.roles.org_add_role),
            org_a_member)

    # validate superuser can add a role to same group
    assert validate_roles(
        Test(object_id=org_a, role=auth.roles.org_add_role),
        superuser)


def test_asset_create():
    # validate profile with asset_create can make new assets
    assert validate_roles(
        Test(role=auth.roles.asset_create),
        org_a_member)

    # validate superuser can make a new asset
    assert validate_roles(
        Test(role=auth.roles.asset_create),
        superuser)

    # validate profile without asset_create can not make new assets
    with pytest.raises(HTTPException):
        validate_roles(Test(role=auth.roles.asset_create),
                       set())


def test_asset_update():
    asset_a_owner_scope = Scope(
        profile=Profile(profile_seq=asset_a_owner_seq),
        asset=Asset(owner_seq=asset_a_owner_seq),
        asset_version=AssetVersion(author_seq=asset_a_author_seq))
    asset_a_org_member_scope = Scope(
        profile=Profile(profile_seq=asset_b_owner_seq),
        asset=Asset(owner_seq=asset_a_owner_seq, org_seq=org_a_seq),
        asset_version=AssetVersion(author_seq=asset_a_author_seq))
    asset_b_owner_scope = Scope(
        profile=Profile(profile_seq=asset_b_owner_seq),
        asset=Asset(owner_seq=asset_b_owner_seq),
        asset_version=AssetVersion(author_seq=asset_b_author_seq))
    asset_b_author_scope = Scope(
        profile=Profile(profile_seq=asset_b_author_seq),
        asset=Asset(owner_seq=asset_b_owner_seq),
        asset_version=AssetVersion(author_seq=asset_b_author_seq))
    asset_a_super_scope = Scope(
        profile=Profile(profile_seq=superuser_seq),
        asset=Asset(owner_seq=asset_a_owner_seq),
        asset_version=AssetVersion(author_seq=asset_a_author_seq))

    # validate owner can modify owned assets
    assert validate_roles(
        Test(role=auth.roles.asset_update, object_id=asset_a),
        org_a_member,
        asset_a_owner_scope)

    # validate superuser can modify user assets
    assert validate_roles(
        Test(role=auth.roles.asset_update, object_id=asset_a),
        superuser,
        asset_a_super_scope)

    # validate org member can modify assets associated with org
    assert validate_roles(
        Test(role=auth.roles.asset_update, object_id=asset_a),
        org_a_member,
        asset_a_org_member_scope)

    # validate owner
    # validate profile with asset_update on specific asset can modify self assets
    assert validate_roles(Test(role=auth.roles.asset_update, object_id=asset_a),
                          org_a_member,
                          asset_a_owner_scope)

    # validate profile with asset_update not on org can not modify org assets
    with pytest.raises(HTTPException):
        validate_roles(Test(role=auth.roles.asset_update, object_id=asset_a),
                       org_b_admin,
                       asset_a_org_member_scope)


def test_global_tag_roles():
    # validate global role
    assert validate_roles(Test(role=auth.roles.tag_create), superuser)
    assert validate_roles(Test(role=auth.roles.tag_update), superuser)
    with pytest.raises(HTTPException):
        validate_roles(Test(role=auth.roles.tag_create), org_b_admin)
    with pytest.raises(HTTPException):
        validate_roles(Test(role=auth.roles.tag_update), org_b_admin)
