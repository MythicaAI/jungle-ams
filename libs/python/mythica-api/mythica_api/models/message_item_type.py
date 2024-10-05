from enum import Enum


class MessageItemType(str, Enum):
    MESSAGE = "message"

    def __str__(self) -> str:
        return str(self.value)
