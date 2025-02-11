"""Utils for models types"""

from functools import partial
from http import HTTPStatus
from typing import Any, Callable, Dict, Optional, Union

from cryptid.cryptid import file_id_to_seq, file_seq_to_id
from fastapi import HTTPException
from sqlalchemy import Select, desc
from sqlmodel import Session

import assets.repo as assets_repo

from content.locate_content import locate_content_by_seq
from db.schema.assets import Asset, AssetVersion
from db.schema.media import FileContent
from db.schema.profiles import Profile
from routes.file_uploads import enrich_files
from tags.tag_models import TagFileReference, TagType


THUMBNAILS_CONTENT_KEY = 'thumbnails'


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
            assets_repo.asset_join_select.where(AssetVersion.published == True)
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
        return assets_repo.process_join_results(session, results)
    elif tag_type == TagType.file:

        files = session.exec(type_model_query.where(FileContent.deleted == None)).all()
        return enrich_files(session, files, profile)


def resolve_contents_as_json(
    session: Session, in_files_categories: dict[str, list[TagFileReference | str]]
) -> str:
    """Convert any partial content references into fully resolved references"""
    contents = {}

    # resolve all file content types
    for category, content_list in in_files_categories.items():
        contents[category] = resolve_content_list(session, category, content_list)

    return contents


def resolve_content_list(
    session: Session, category: str, in_content_list: list[Union[str, Dict[str, Any]]]
):
    """For each category return the fully resolved version of list of items in the category"""
    if category in THUMBNAILS_CONTENT_KEY:
        return list(map(partial(resolve_tag_file_reference, session), in_content_list))
    elif isinstance(category, str) and isinstance(in_content_list, str):
        return in_content_list


def resolve_tag_file_reference(
    session: Session, file_reference: Union[str, TagFileReference]
) -> dict:
    file_id = file_reference.file_id

    if file_id is None:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            f"file_id required on {str(file_reference)}",
        )
    db_file = locate_content_by_seq(session, file_id_to_seq(file_id))
    if db_file is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"file '{file_id}' not found")

    return TagFileReference(
        file_id=file_seq_to_id(db_file.file_seq),
        file_name=db_file.name,
        content_hash=db_file.content_hash,
        size=db_file.size,
    ).model_dump()
