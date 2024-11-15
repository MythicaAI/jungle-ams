from sqlmodel import Session, select


from db.schema.tags import Tag
from tags.tag_models import get_model_type, TagType


def resolve_type_tags(
    session: Session, tag_type: TagType, type_seq: int
) -> list[(int, str)]:
    """Resolve all the tags for a model_type"""

    model_type = get_model_type(tag_type)

    tag_results = session.exec(
        select(model_type, Tag)
        .where(model_type.type_seq == type_seq)
        .outerjoin(Tag, model_type.tag_seq == Tag.tag_seq)
    ).all()
    converted = [r[1].name for r in tag_results]
    return converted
