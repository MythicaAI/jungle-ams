"""Profiles Queries"""

from sqlalchemy import func
from sqlalchemy.orm import aliased
from sqlmodel import Session, select

from db.schema.profiles import OrgRef, Profile


# Define an alias for OrgRef
OrgRefAlias = aliased(OrgRef)



def get_profile_roles_query(session: Session):
    if session.bind.name == "sqlite":
        role_aggregation_func = func.group_concat(OrgRefAlias.role, ',')  # pylint: disable=not-callable
    else:
        role_aggregation_func = func.array_agg(OrgRefAlias.role)  # pylint: disable=not-callable

    # Subquery to aggregate roles by profile and role
    roles_subquery = (
        select(
            OrgRefAlias.profile_seq,
            OrgRefAlias.org_seq,
            role_aggregation_func.label('roles')
        )
        .group_by(OrgRefAlias.profile_seq, OrgRefAlias.org_seq)
    ).subquery()
    return (
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