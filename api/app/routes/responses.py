"""Shared API responses"""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, AnyHttpUrl

from db.schema.profiles import ProfileSession


class ValidateEmailState(str, Enum):
    """Email validation states"""
    not_validated = "not_validated"
    link_sent = "link_sent"
    validated = "validated"


class ProfileResponse(BaseModel):
    """A model with only allowed public properties for profile creation"""
    profile_id: UUID = None
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
    profile_id: UUID = None
    name: str | None = None
    description: str | None = None
    signature: str | None = None
    profile_base_href: str | None = None
    created: datetime = None


class SessionStartResponse(BaseModel):
    token: str
    profile: ProfileResponse
    sessions: list[ProfileSession]


class ValidateEmailResponse(BaseModel):
    owner_id: UUID
    code: str
    link: AnyHttpUrl
    state: ValidateEmailState = ValidateEmailState.not_validated


class FileUploadResponse(BaseModel):
    file_id: UUID
    owner_id: UUID
    file_name: str
    event_ids: list[UUID]
    size: int
    content_type: str
    content_hash: str = ""
    created: datetime
