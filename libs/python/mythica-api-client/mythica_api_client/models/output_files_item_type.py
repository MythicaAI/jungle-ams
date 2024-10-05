from enum import Enum


class OutputFilesItemType(str, Enum):
    FILE = "file"

    def __str__(self) -> str:
        return str(self.value)
