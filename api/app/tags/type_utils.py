from typing import Union

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from cryptid.cryptid import tag_seq_to_id
from db.schema.tags import Tag
from tags.tag_models import TagResponse, get_model_type, TagType


async def resolve_type_tags(
        db_session: AsyncSession, tag_type: TagType, type_seq: int
) -> list[dict[str, Union[str, int]]]:
    """Resolve all the tags for a model_type"""

    model_type = get_model_type(tag_type)

    tag_results = (await db_session.exec(
        select(model_type, Tag)
        .where(model_type.type_seq == type_seq)
        .outerjoin(Tag, model_type.tag_seq == Tag.tag_seq)
    )).all()
    converted = [
        TagResponse(
            name=r[1].name,
            tag_id=tag_seq_to_id(r[1].tag_seq),
            page_priority=r[1].page_priority,
            contents=r[1].contents,
        )
        for r in tag_results
    ] if tag_results else []
    return converted
