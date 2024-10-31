"""Profiles Queries"""

from pydantic import BaseModel
from sqlalchemy.orm import aliased
from sqlmodel import Session, select

from db.schema.profiles import Org, OrgRef, Profile
from profiles.responses import PublicProfileResponse

# Define an alias for OrgRef
OrgRefAlias = aliased(OrgRef)


def get_profile_roles(session: Session, profile_seq: int) -> ProfileRolesResponse:
    """Get the profile, organization and associated roles"""
    results = session.exec(select(Profile, Org, OrgRef)
                           .where(Profile.profile_seq == profile_seq)
                           .where(Profile.profile_seq == OrgRef.profile_seq)
                           .outerjoin(Profile.org_seq, Org.org_seq)
                           .outerjoin(Org.org_seq, OrgRef.org_seq)
                           .group_by(Profile.profile_seq)
                           ).all()
    profile = results[0]
    org = results[1]
    roles = [r.role for r in results]
    return ProfileRolesResponse(profile=profile, org=org, roles=roles)
