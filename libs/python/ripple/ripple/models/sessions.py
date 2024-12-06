"""
Models for ripples of session data
"""

from pydantic import BaseModel


class SessionProfile(BaseModel):
    """Data stored for a session in a token"""
    profile_seq: int  # cached for API internals
    profile_id: str
    email: str
    email_validate_state: int
    location: str
    environment: str
    auth_roles: set[str]


class OrgRef(BaseModel):
    """Data flowing through ripple about orgs"""
    org_seq: int
    org_id: str
