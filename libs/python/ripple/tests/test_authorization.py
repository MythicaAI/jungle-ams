"""Test the authorization module directly"""
import auth.roles
import pytest
from cryptid.cryptid import asset_seq_to_id, org_seq_to_id, profile_seq_to_id
from db.schema.assets import Asset, AssetVersion
from fastapi import HTTPException
from ripple.auth.authorization import Scope, validate_roles
from ripple.auth.generate_token import SessionProfile

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


def test_org_create_role():
    # validate admin of object_a can add role
    assert validate_roles(
        object_id=org_a,
        role=auth.roles.org_create_role,
        auth_roles=org_a_admin)

    # validate other admin cannot add roles to org_a
    with pytest.raises(HTTPException):
        validate_roles(
            object_id=org_a,
            role=auth.roles.org_create_role,
            auth_roles=org_b_admin)

    # validate user of org_a can not add role to same group
    with pytest.raises(HTTPException):
        validate_roles(
            object_id=org_a,
            role=auth.roles.org_create_role,
            auth_roles=org_a_member)

    # validate superuser can add a role to same group
    assert validate_roles(
        object_id=org_a,
        role=auth.roles.org_create_role,
        auth_roles=superuser)


def test_asset_create():
    # validate profile with asset_create can make new assets
    assert validate_roles(
        role=auth.roles.asset_create,
        auth_roles=org_a_member)

    # validate superuser can make a new asset
    assert validate_roles(
        role=auth.roles.asset_create,
        auth_roles=superuser)

    # validate profile without asset_create can not make new assets
    with pytest.raises(HTTPException):
        validate_roles(
            role=auth.roles.asset_create,
            auth_roles=set())


def generate_session_profile(profile_seq: int) -> SessionProfile:
    """Generate a simple test session profile"""
    return SessionProfile(
        profile_seq=profile_seq,
        profile_id=profile_seq_to_id(profile_seq),
        email='none@none.com',
        email_validate_state=2,
        location='local-test',
        environment='test',
        auth_roles=set())


def test_asset_update():
    asset_a_owner_scope = Scope(
        profile=generate_session_profile(profile_seq=asset_a_owner_seq),
        asset=Asset(owner_seq=asset_a_owner_seq),
        asset_version=AssetVersion(author_seq=asset_a_author_seq))
    asset_a_org_member_scope = Scope(
        profile=generate_session_profile(profile_seq=asset_b_owner_seq),
        asset=Asset(owner_seq=asset_a_owner_seq, org_seq=org_a_seq),
        asset_version=AssetVersion(author_seq=asset_a_author_seq))
    asset_a_super_scope = Scope(
        profile=generate_session_profile(profile_seq=superuser_seq),
        asset=Asset(owner_seq=asset_a_owner_seq),
        asset_version=AssetVersion(author_seq=asset_a_author_seq))

    # validate owner can modify owned assets
    assert validate_roles(
        role=auth.roles.asset_update,
        object_id=asset_a,
        auth_roles=org_a_member,
        scope=asset_a_owner_scope)

    # validate superuser can modify user assets
    assert validate_roles(
        role=auth.roles.asset_update,
        object_id=asset_a,
        auth_roles=superuser,
        scope=asset_a_super_scope)

    # validate org member can modify assets associated with org
    assert validate_roles(
        role=auth.roles.asset_update,
        object_id=asset_a,
        auth_roles=org_a_member,
        scope=asset_a_org_member_scope)

    # validate owner
    # validate profile with asset_update on specific asset can modify self assets
    assert validate_roles(
        role=auth.roles.asset_update,
        object_id=asset_a,
        auth_roles=org_a_member,
        scope=asset_a_owner_scope)

    # validate profile with asset_update not on org can not modify org assets
    with pytest.raises(HTTPException):
        validate_roles(
            role=auth.roles.asset_update,
            object_id=asset_a,
            auth_roles=org_b_admin,
            scope=asset_a_org_member_scope)


def test_asset_delete():
    asset_a_owner_scope = Scope(
        profile=generate_session_profile(profile_seq=asset_a_owner_seq),
        asset=Asset(owner_seq=asset_a_owner_seq),
        asset_version=AssetVersion(author_seq=asset_a_author_seq))
    asset_a_org_member_scope = Scope(
        profile=generate_session_profile(profile_seq=asset_b_owner_seq),
        asset=Asset(owner_seq=asset_a_owner_seq, org_seq=org_a_seq),
        asset_version=AssetVersion(author_seq=asset_a_author_seq))
    asset_a_super_scope = Scope(
        profile=generate_session_profile(profile_seq=superuser_seq),
        asset=Asset(owner_seq=asset_a_owner_seq),
        asset_version=AssetVersion(author_seq=asset_a_author_seq))

    # validate owner can delete owned assets
    assert validate_roles(
        role=auth.roles.asset_delete,
        object_id=asset_a,
        auth_roles=org_a_member,
        scope=asset_a_owner_scope)

    # validate superuser can delete user assets
    assert validate_roles(
        role=auth.roles.asset_delete,
        object_id=asset_a,
        auth_roles=superuser,
        scope=asset_a_super_scope)

    # validate org member can delete assets associated with org
    assert validate_roles(
        role=auth.roles.asset_delete,
        object_id=asset_a,
        auth_roles=org_a_member,
        scope=asset_a_org_member_scope)

    # validate owner
    # validate profile with asset_delete on specific asset can delete self assets
    assert validate_roles(
        role=auth.roles.asset_delete,
        object_id=asset_a,
        auth_roles=org_a_member,
        scope=asset_a_owner_scope)

    # validate profile with asset_delete not on org can not delete org assets
    with pytest.raises(HTTPException):
        validate_roles(
            role=auth.roles.asset_delete,
            object_id=asset_a,
            auth_roles=org_b_admin,
            scope=asset_a_org_member_scope)


def test_validate_role_only_asset():
    asset_a_owner_scope = Scope(
        profile=generate_session_profile(profile_seq=asset_a_owner_seq),
        asset=Asset(owner_seq=asset_a_owner_seq))
    asset_a_org_member_scope = Scope(
        profile=generate_session_profile(profile_seq=asset_b_owner_seq),
        asset=Asset(owner_seq=asset_a_owner_seq, org_seq=org_a_seq))
    asset_a_super_scope = Scope(
        profile=generate_session_profile(profile_seq=superuser_seq),
        asset=Asset(owner_seq=asset_a_owner_seq))

    # validate owner can delete owned assets
    assert validate_roles(
        role=auth.roles.asset_delete,
        object_id=asset_a,
        auth_roles=org_a_member,
        scope=asset_a_owner_scope,
        only_asset=True)

    # validate superuser can delete user assets
    assert validate_roles(
        role=auth.roles.asset_delete,
        object_id=asset_a,
        auth_roles=superuser,
        scope=asset_a_super_scope,
        only_asset=True)

    # validate org member can delete assets associated with org
    assert validate_roles(
        role=auth.roles.asset_delete,
        object_id=asset_a,
        auth_roles=org_a_member,
        scope=asset_a_org_member_scope,
        only_asset=True)

    # validate owner
    # validate profile with asset_delete on specific asset can delete self assets
    assert validate_roles(
        role=auth.roles.asset_delete,
        object_id=asset_a,
        auth_roles=org_a_member,
        scope=asset_a_owner_scope,
        only_asset=True)

    # validate profile with asset_delete not on org can not delete org assets
    with pytest.raises(HTTPException):
        validate_roles(
            role=auth.roles.asset_delete,
            object_id=asset_a,
            auth_roles=org_b_admin,
            scope=asset_a_org_member_scope,
            only_asset=True)


def test_global_tag_roles():
    # validate global role
    assert validate_roles(
        role=auth.roles.tag_create,
        auth_roles=superuser)
    assert validate_roles(
        role=auth.roles.tag_update,
        auth_roles=superuser)
    with pytest.raises(HTTPException):
        validate_roles(
            role=auth.roles.tag_create,
            auth_roles=org_b_admin)
    with pytest.raises(HTTPException):
        validate_roles(
            role=auth.roles.tag_update,
            auth_roles=org_b_admin)


def test_missing_asset_scope():
    """Test failure validate asset ownership without an asset_version in scope"""
    with pytest.raises(HTTPException):
        profile = generate_session_profile(profile_seq=asset_a_owner_seq)
        asset = Asset(owner_seq=asset_a_owner_seq)
        validate_roles(
            role=auth.roles.asset_update,
            auth_roles=org_a_member,
            scope=Scope(profile=profile, asset=asset)
        )


def test_missing_org_asset_role():
    """Test failure to validate asset role at org level"""
    with pytest.raises(HTTPException):
        profile = generate_session_profile(profile_seq=asset_a_owner_seq)
        asset = Asset(owner_seq=asset_a_owner_seq)
        asset_version = AssetVersion(author_seq=asset_a_author_seq)
        validate_roles(
            role="asset/invalid_role",
            auth_roles=org_a_member,
            scope=Scope(profile=profile, asset=asset, asset_version=asset_version)
        )


def test_simple_global_role():
    assert validate_roles(role=auth.roles.alias_tag_author, auth_roles=superuser)


def test_invalid_role_namespace():
    with pytest.raises(HTTPException):
        validate_roles(role="foo/some_role:^", auth_roles=org_a_member)
