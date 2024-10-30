"""Utils for models types"""

from typing import Callable, Optional, Union

from cryptid.cryptid import (
    asset_id_to_seq,
    file_id_to_seq,
)
from sqlalchemy import Select, desc
from sqlmodel import Field, Session

from assets.assets_repo import asset_join_select, process_join_results
from db.schema.assets import AssetTag, Asset, AssetVersion
from db.schema.media import FileTag, FileContent
from db.schema.profiles import Profile
from routes.file_uploads import enrich_files
from routes.tags.tag_models import TagType


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


def process_type_model_result(
    tag_type: TagType,
    session: Session,
    type_model_query: Optional[Select],
    profile: Optional[Profile],
    limit: int,
    offset: int,
) -> Callable:
    "Dynamically return the type_model response"
    if tag_type == TagType.asset:
        subquery = type_model_query.subquery()

        query = (
            asset_join_select
            .join(subquery, Asset.asset_seq == subquery.c.asset_seq)
            .order_by(
                desc(AssetVersion.major),
                desc(AssetVersion.minor),
                desc(AssetVersion.patch),
            )
            .limit(limit)
            .offset(offset)
        )
        results = session.exec(query)
        return process_join_results(session, results)
    elif tag_type == TagType.file:

        files = session.exec(
            type_model_query.where(FileContent.deleted == None)
        ).all()
        return enrich_files(session, files, profile)
