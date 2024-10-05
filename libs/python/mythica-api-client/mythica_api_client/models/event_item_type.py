from enum import Enum


class EventItemType(str, Enum):
    EVENT = "event"

    def __str__(self) -> str:
        return str(self.value)
