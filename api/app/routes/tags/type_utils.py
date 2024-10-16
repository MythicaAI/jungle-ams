"""API routing layer and logic for key management"""

from http import HTTPStatus
from typing import Callable

from cryptid.cryptid import (
    asset_id_to_seq,
)
from fastapi import HTTPException
from sqlmodel import Field

from db.schema.assets import AssetTag, Asset
from routes.tags.tag_models import TagType


def get_model_type(tag_type: TagType) -> AssetTag:
    "Dynamically get the model class"
    model_map = {
        TagType.asset: AssetTag,
    }
    return model_map.get(tag_type)


def get_model_of_model_type(tag_type: TagType) -> Asset:
    "Dynamically get the model class"
    model_map = {
        TagType.asset: Asset,
    }
    return model_map.get(tag_type)


def get_model_type_seq_col(tag_type: TagType) -> Field:
    "Dynamically get the model class"
    model_map = {
        TagType.asset: Asset.asset_seq,
    }
    return model_map.get(tag_type)


def get_type_id_to_seq(tag_type: TagType) -> Callable:
    "Dynamically return the appropriate ID conversion function for a given tag type"
    if tag_type == TagType.asset:
        return asset_id_to_seq
    raise HTTPException(HTTPStatus.BAD_REQUEST, detail=f"Invalid tag type: {tag_type}")
