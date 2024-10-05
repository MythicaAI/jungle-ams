from enum import Enum


class ValidateEmailState(str, Enum):
    LINK_SENT = "link_sent"
    NOT_VALIDATED = "not_validated"
    VALIDATED = "validated"

    def __str__(self) -> str:
        return str(self.value)
