from enum import Enum


class CreateReaderRequestDirection(str, Enum):
    AFTER = "after"
    BEFORE = "before"

    def __str__(self) -> str:
        return str(self.value)
