"""Profiles Queries"""

from sqlalchemy import func
from sqlalchemy.orm import aliased
from sqlmodel import select

from db.schema.profiles import OrgRef, Profile


# Define an alias for OrgRef
OrgRefAlias = aliased(OrgRef)

# Subquery to aggregate roles by profile and role
roles_subquery = (
    select(
        OrgRefAlias.profile_seq,
        OrgRefAlias.org_seq,
        func.array_agg(OrgRefAlias.role).label('roles')  # pylint: disable=not-callable
    )
    .group_by(OrgRefAlias.profile_seq, OrgRefAlias.org_seq)
).subquery()

profile_roles_query = (
    select(
        Profile,
        func.json_agg(
            func.json_build_object(
                'org_id', roles_subquery.c.org_seq,
                'roles', roles_subquery.c.roles
            )
        ).label('org_roles'),
    )
    .outerjoin(roles_subquery, roles_subquery.c.profile_seq == Profile.profile_seq)
    .group_by(Profile.profile_seq)
)