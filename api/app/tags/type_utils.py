from async_lru import alru_cache
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from cryptid.cryptid import tag_seq_to_id
from db.schema.tags import Tag
from tags.tag_models import CachedTag, TagResponse, TagType, get_model_type


@alru_cache(maxsize=1, ttl=10)
async def get_cached_tags(db_session) -> dict[int, CachedTag]:
    results = (await db_session.exec(select(Tag))).all()
    return {
        tag.tag_seq: CachedTag(
            name=tag.name,
            page_priority=tag.page_priority,
            contents=tag.contents,
        )
        for tag in results
    }


async def resolve_type_tags(
        db_session: AsyncSession, tag_type: TagType, type_seq: int
) -> list[TagResponse]:
    """Resolve all the tags for a model_type"""

    model_type = get_model_type(tag_type)
    cached_tags = await get_cached_tags(db_session)
    tag_results = (await db_session.exec(
        select(model_type).where(model_type.type_seq == type_seq)
    )).all()

    # enrich results with cached tag metadata
    converted = []
    for r in tag_results:
        tag_id = tag_seq_to_id(r.tag_seq)
        cached_tag = cached_tags[r.tag_seq]
        if not cached_tag:
            # tag not in cache
            continue
        converted.append(TagResponse(
            name=cached_tag.name,
            tag_id=tag_id,
            page_priority=cached_tag.page_priority,
            contents=cached_tag.contents
        ))
    return converted
