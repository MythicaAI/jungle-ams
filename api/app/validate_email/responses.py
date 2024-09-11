from enum import Enum

from pydantic import AnyHttpUrl, BaseModel


class ValidateEmailState(str, Enum):
    """Email validation states"""
    not_validated = "not_validated"
    link_sent = "link_sent"
    validated = "validated"


class ValidateEmailResponse(BaseModel):
    """Response returned to a email validation request"""
    owner_id: str
    code: str
    link: AnyHttpUrl
    state: ValidateEmailState = ValidateEmailState.not_validated


def email_validate_state_enum(email_validation_state: int) -> ValidateEmailState:
    """Convert the database int to the pydantic enum"""
    if email_validation_state == 0:
        return ValidateEmailState.not_validated
    elif email_validation_state == 1:
        return ValidateEmailState.link_sent
    elif email_validation_state == 2:
        return ValidateEmailState.validated
    return ValidateEmailState.not_validated
