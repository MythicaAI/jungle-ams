"""API routing layer and logic for key management"""

from enum import Enum
from datetime import datetime, timezone
from http import HTTPStatus
from typing import Callable

from better_profanity import profanity
from cryptid.cryptid import (
    asset_id_to_seq,
    profile_seq_to_id,
    tag_id_to_seq,
    tag_seq_to_id,
)
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator
from sqlalchemy import func
from sqlmodel import col, delete, insert, select, Field

from db.connection import TZ, get_session
from db.schema.assets import AssetTag, Asset
from db.schema.profiles import Profile
from db.schema.tags import Tag
from routes.authorization import current_profile
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
