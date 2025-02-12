"""Tags models"""

from enum import Enum
from typing import Callable, Optional, Union

from better_profanity import profanity
from cryptid.cryptid import asset_id_to_seq, file_id_to_seq
from pydantic import BaseModel, Field, field_validator

from db.schema.assets import Asset, AssetTag
from db.schema.media import FileContent, FileTag


class TagType(str, Enum):
    asset = "asset"
    file = "file"


class TagFileReference(BaseModel):
    """Embedded file reference in a tag content.

    When creating a new asset version only the file_id and the relative path (name) are required.

    When the file is resolved during the creation of the version it will receive the content
    hash and size from the underlying file_id"""
    file_id: str
    file_name: Optional[str] = None
    content_hash: Optional[str] = None
    size: Optional[int] = None


class TagRequest(BaseModel):
    name: str
    page_priority: Optional[int] = None
    contents: Optional[dict[str, str | list[TagFileReference] | None]] = None

    @field_validator('name')
    @classmethod
    def check_profanity(cls, name: str) -> str:
        if profanity.contains_profanity(name):
            raise ValueError("Tag name contains inappropriate language.")
        return name

class TagUpdateRequest(TagRequest):
    name: Optional[str] = None


class TagResponse(BaseModel):
    name: str
    tag_id: str
    page_priority: Optional[int] = None
    contents: Optional[dict[str, str | None | list[TagFileReference]]] = None


class TagTypeRequest(BaseModel):
    tag_id: str
    type_id: str



def get_model_type(tag_type: TagType) -> Union[AssetTag, FileTag]:
    "Dynamically get the model class"
    model_map = {
        TagType.asset: AssetTag,
        TagType.file: FileTag,
    }
    return model_map.get(tag_type)


def get_model_of_model_type(tag_type: TagType) -> Union[Asset, FileContent]:
    "Dynamically get the model class"
    model_map = {
        TagType.asset: Asset,
        TagType.file: FileContent,
    }
    return model_map.get(tag_type)


def get_model_type_seq_col(tag_type: TagType) -> Field:
    "Dynamically get the model class"
    model_map = {
        TagType.asset: Asset.asset_seq,
        TagType.file: FileContent.file_seq,
    }
    return model_map.get(tag_type)


def get_type_id_to_seq(tag_type: TagType) -> Callable:
    "Dynamically return the appropriate ID conversion function for a given tag type"
    if tag_type == TagType.asset:
        return asset_id_to_seq
    if tag_type == TagType.file:
        return file_id_to_seq

