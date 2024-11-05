from datetime import datetime

from pydantic import BaseModel

from cryptid.cryptid import profile_seq_to_id
from db.schema.profiles import Profile
from validate_email.responses import ValidateEmailState, email_validate_state_enum


class ProfileResponse(BaseModel):
    """A model with only allowed public properties for profile creation"""
    profile_id: str = None
    name: str | None = None
    description: str | None = None
    email: str | None = None
    signature: str | None = None
    profile_base_href: str | None = None
    active: bool = None
    created: datetime = None
    updated: datetime | None = None
    validate_state: ValidateEmailState | int = None


class PublicProfileResponse(BaseModel):
    """A model with only allows anonymous public properties for profile query"""
    profile_id: str = None
    name: str | None = None
    description: str | None = None
    signature: str | None = None
    profile_base_href: str | None = None
    created: datetime = None


class SessionStartResponse(BaseModel):
    """Response to initiating a session, the token is used as a Bearer token"""
    token: str
    profile: ProfileResponse
    roles: list[str]


class ProfileOrgRoles(BaseModel):
    """List item of organizational membership and allowed roles"""
    org_id: str
    org_name: str
    roles: list[str]


class ProfileRolesResponse(BaseModel):
    """A profile and all organization roles it owns and if allowed, the auth roles"""
    profile: PublicProfileResponse
    org_roles: list[ProfileOrgRoles]
    auth_roles: list[str]


def profile_to_profile_response(
        profile: Profile,
        model_type: type
) -> ProfileResponse | PublicProfileResponse:
    """Convert a profile to a valid profile response object"""
    profile_data = profile.model_dump()
    validate_state = email_validate_state_enum(profile.email_validate_state)
    profile_response = model_type(
        **profile_data,
        profile_id=profile_seq_to_id(profile.profile_seq),
        validate_state=validate_state)
    return profile_response
