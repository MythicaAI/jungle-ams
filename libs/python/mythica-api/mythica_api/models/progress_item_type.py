from enum import Enum


class ProgressItemType(str, Enum):
    PROGRESS = "progress"

    def __str__(self) -> str:
        return str(self.value)
