from http import HTTPStatus

from fastapi import HTTPException
from sqlmodel import Session, select

from cryptid.cryptid import org_seq_to_id, profile_seq_to_id
from db.schema.profiles import Org, OrgRef, Profile
from profiles.responses import ProfileOrgRoles


def load_profile_and_roles(
        session: Session,
        profile_seq: int) -> tuple[Profile, list[ProfileOrgRoles]]:
    """Collect the set of org references for the requested profile from the database"""
    profile_org_results = session.exec(select(Profile, Org, OrgRef)
                                       .where(Profile.profile_seq == profile_seq)
                                       .outerjoin(OrgRef, Profile.profile_seq == OrgRef.profile_seq)
                                       .outerjoin(Org, Org.org_seq == OrgRef.org_seq)
                                       ).all()
    if not profile_org_results:
        raise HTTPException(
            HTTPStatus.NOT_FOUND,
            f"profile {profile_seq_to_id(profile_seq)} not found")

    roles_by_org_id = {}
    org_data_by_org_id = {}
    for r in profile_org_results:
        r_profile, r_org, r_org_ref = r
        # Bail out if there are no references to process
        if r_org is None:
            return r_profile, []

        org_id = org_seq_to_id(r_org.org_seq)
        org_data_by_org_id[org_id] = r_org.name
        roles_by_org_id.setdefault(org_id, set()).add(r_org_ref.role)

    # Convert all the org references into ProfileOrgRoles
    profile_org_roles = [
        ProfileOrgRoles(
            org_id=i,
            org_name=org_data_by_org_id.get(i, "##error"),
            roles=v
        ) for i, v in roles_by_org_id.items()
    ]
    profile = profile_org_results[0][0]

    return profile, profile_org_roles
