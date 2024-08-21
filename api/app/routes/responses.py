"""Shared API responses"""

from datetime import datetime
from enum import Enum

from pydantic import AnyHttpUrl, BaseModel

from auth.api_id import profile_seq_to_id
from db.schema.profiles import Profile


class ValidateEmailState(str, Enum):
    """Email validation states"""
    not_validated = "not_validated"
    link_sent = "link_sent"
    validated = "validated"


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
    token: str
    profile: ProfileResponse


class ValidateEmailResponse(BaseModel):
    owner_id: str
    code: str
    link: AnyHttpUrl
    state: ValidateEmailState = ValidateEmailState.not_validated


class FileUploadResponse(BaseModel):
    file_id: str
    owner_id: str
    file_name: str
    event_ids: list[str]
    size: int
    content_type: str
    content_hash: str = ""
    created: datetime


def email_validate_state_enum(email_validation_state: int) -> ValidateEmailState:
    """Convert the database int to the pydantic enum"""
    if email_validation_state == 0:
        return ValidateEmailState.not_validated
    elif email_validation_state == 1:
        return ValidateEmailState.link_sent
    elif email_validation_state == 2:
        return ValidateEmailState.validated
    return ValidateEmailState.not_validated


def profile_to_profile_response(profile: Profile, model_type: type) \
        -> ProfileResponse | PublicProfileResponse:
    """Convert a profile to a valid profile response object"""
    profile_data = profile.model_dump()
    validate_state = email_validate_state_enum(profile.email_validate_state)
    profile_response = model_type(**profile_data,
                                  profile_id=profile_seq_to_id(profile.profile_seq),
                                  validate_state=validate_state)
    return profile_response
