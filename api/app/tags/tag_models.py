"""Tags models"""

from enum import Enum
from typing import Callable, Union

from better_profanity import profanity
from cryptid.cryptid import asset_id_to_seq, file_id_to_seq
from pydantic import BaseModel, Field, field_validator

from db.schema.assets import Asset, AssetTag
from db.schema.media import FileContent, FileTag


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

