from enum import Enum


class ReaderResponseDirectionType0(str, Enum):
    AFTER = "after"
    BEFORE = "before"

    def __str__(self) -> str:
        return str(self.value)
