"""
Models for ripples of session data
"""

from pydantic import BaseModel


class SessionProfile(BaseModel):
    """Data stored for a session in a token"""
    auth_token: str  # Mythica auth token that instantiated the session
    profile_seq: int  # cached for API internals
    profile_id: str
    email: str
    email_validate_state: int
    location: str
    environment: str
    auth_roles: set[str]
    impersonated: bool


class OrgRef(BaseModel):
    """Data flowing through ripple about orgs"""
    org_seq: int
    org_id: str
