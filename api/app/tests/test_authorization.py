import auth.roles as roles
from auth.authorization import validate_roles


def test_admin():
    admin_profile_roles = {'admin'}
    assert validate_roles(roles.org_add_role, admin_profile_roles)
    assert validate_roles( 'foo', admin_profile_roles)

    user_profile_roles = {'user'}
    assert validate_roles(roles.asset_create, user_profile_roles)
