"""Tags models"""

from enum import Enum
from datetime import datetime

from better_profanity import profanity
from pydantic import BaseModel, field_validator



class TagType(str, Enum):
    asset = "asset"
    file = "file"


class TagRequest(BaseModel):
    name: str

    @field_validator('name')
    @classmethod
    def check_profanity(cls, name: str) -> str:
        if profanity.contains_profanity(name):
            raise ValueError("Tag name contains inappropriate language.")
        return name


class TagResponse(BaseModel):
    name: str
    tag_id: str
    owner_id: str = None
    created: datetime


class TagTypeRequest(BaseModel):
    tag_id: str
    type_id: str
