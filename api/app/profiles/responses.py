from datetime import datetime
from typing import Union

from pydantic import BaseModel, field_validator

from cryptid.cryptid import org_seq_to_id, profile_seq_to_id
from db.schema.profiles import Profile
from validate_email.responses import ValidateEmailState, email_validate_state_enum


class ProfileRoles(BaseModel):
    org_roles: list[dict[str, Union[str, list]]] | None = None

    @field_validator('org_roles', mode="before")
    @classmethod
    def convert_org_seq_to_id(cls, org_roles: list[dict[int, str]] | None) -> list[dict[str, str]] | None:
        converted_org_roles = []
        if org_roles and isinstance(org_roles, list):
            for org_role in org_roles:
                if org_role.get("org_id", {}):
                    org_role["org_id"] = org_seq_to_id(org_role["org_id"])
                else:
                    org_role = {}
                converted_org_roles.append(org_role)
        return converted_org_roles


class ProfileResponse(ProfileRoles):
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


class PublicProfileResponse(ProfileRoles):
    """A model with only allows anonymous public properties for profile query"""
    profile_id: str = None
    name: str | None = None
    description: str | None = None
    signature: str | None = None
    profile_base_href: str | None = None
    created: datetime = None


class SessionStartResponse(BaseModel):
    token: str
    profile: ProfileResponse


def profile_to_profile_response(
    profile_roles: Union[tuple[Profile, dict], Profile],
    model_type: type,
    with_roles=False,
) -> ProfileResponse | PublicProfileResponse:
    """Convert a profile to a valid profile response object"""
    org_roles = {}
    profile = profile_roles
    if with_roles:
        profile, org_roles = profile_roles
    profile_data = profile.model_dump()
    if with_roles:
        profile_data["org_roles"] = org_roles
    validate_state = email_validate_state_enum(profile.email_validate_state)
    profile_response = model_type(
        **profile_data,
        profile_id=profile_seq_to_id(profile.profile_seq),
        validate_state=validate_state
    )
    return profile_response
