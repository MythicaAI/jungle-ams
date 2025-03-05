"""Utils for models types"""
from http import HTTPStatus
from typing import Any, Dict, Union

from content.locate_content import locate_content_by_seq
from cryptid.cryptid import file_id_to_seq, file_seq_to_id
from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from tags.tag_models import TagFileReference

THUMBNAILS_CONTENT_KEY = 'thumbnails'


async def resolve_contents_as_json(
        db_session: AsyncSession, in_files_categories: dict[str, list[TagFileReference | str]]
) -> dict[str, list[dict]]:
    """Convert any partial content references into fully resolved references"""
    contents = {}

    # resolve all file content types
    for category, content_list in in_files_categories.items():
        contents[category] = await resolve_content_list(db_session, category, content_list)

    return contents


async def resolve_content_list(
        db_session: AsyncSession, category: str, in_content_list: list[Union[str, Dict[str, Any]]]
):
    """For each category return the fully resolved version of list of items in the category"""
    if category in THUMBNAILS_CONTENT_KEY:
        return [await resolve_tag_file_reference(db_session, file_ref) for file_ref in in_content_list]
    elif isinstance(category, str) and isinstance(in_content_list, str):
        return in_content_list


async def resolve_tag_file_reference(
        db_session: AsyncSession, file_reference: Union[str, TagFileReference]
) -> dict:
    file_id = file_reference.file_id

    if file_id is None:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            f"file_id required on {str(file_reference)}",
        )
    db_file = await locate_content_by_seq(db_session, file_id_to_seq(file_id))
    if db_file is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"file '{file_id}' not found")

    return TagFileReference(
        file_id=file_seq_to_id(db_file.file_seq),
        file_name=db_file.name,
        content_hash=db_file.content_hash,
        size=db_file.size,
    ).model_dump()
