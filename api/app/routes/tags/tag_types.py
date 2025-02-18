"""API routing layer and logic for tag management for model types"""

import logging
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, delete, insert, select
from sqlmodel.ext.asyncio.session import AsyncSession

from cryptid.cryptid import (
    tag_id_to_seq,
    tag_seq_to_id,
)
from db.connection import get_db_session
from db.schema.profiles import Profile
from db.schema.tags import Tag
from ripple.auth import roles
from ripple.auth.authorization import validate_roles
from routes.authorization import maybe_session_profile, session_profile
from tags.repo import process_type_model_result
from tags.tag_models import (TagResponse, TagType, TagTypeRequest, get_model_of_model_type, get_model_type,
                             get_model_type_seq_col, get_type_id_to_seq)

log = logging.getLogger(__name__)

router = APIRouter(prefix='/types', tags=['tags'])


@router.post('/{tag_type}', status_code=HTTPStatus.CREATED)
async def create_tag_for_type(
        tag_type: TagType,
        create: TagTypeRequest,
        response: Response,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)):
    validate_roles(role=roles.tag_create, auth_roles=profile.auth_roles)

    type_model = get_model_type(tag_type)
    model_of_type_model = get_model_of_model_type(tag_type)
    type_id_to_seq = get_type_id_to_seq(tag_type)
    model_type_seq_col = get_model_type_seq_col(tag_type)

    tag_seq = tag_id_to_seq(create.tag_id)
    type_seq = type_id_to_seq(create.type_id)

    insert_dict = {
        "tag_seq": tag_seq,
        "type_seq": type_seq,
    }

    model_exists = (await session.exec(
        select(model_of_type_model)
        .where(model_type_seq_col == type_seq)
    )).first()

    if not model_exists:
        raise HTTPException(
            HTTPStatus.FORBIDDEN,
            detail=f"You are not authorized to create tag for this {tag_type}:{create.type_id}",
        )

    try:
        await db_session.exec(insert(type_model).values(**insert_dict))
        await db_session.commit()
    except IntegrityError:
        await db_session.rollback()
        log.info("tag assignment already exists: %s -> %s",
                 create.tag_id,
                 create.type_id)
        response.status_code = HTTPStatus.OK

    return {"tag_id": create.tag_id, "type_id": create.type_id}


@router.get('/{tag_type}')
async def get_tags_for_type(
        tag_type: TagType,
        profile: Optional[Profile] = Depends(maybe_session_profile),
        limit: int = Query(1, le=100),
        offset: int = 0,
        db_session: AsyncSession = Depends(get_db_session)
):
    if tag_type == TagType.file:
        if not profile:
            raise HTTPException(
                HTTPStatus.FORBIDDEN,
                detail="You must be logged into the system to enrich files."
            )
    type_model = get_model_type(tag_type)

    tags = (await db_session.exec(
        select(Tag)
        .where(
            col(Tag.tag_seq).in_(  # pylint: disable=no-member
                select(type_model.tag_seq).distinct()
            )
        )
        .limit(limit)
        .offset(offset)
    )).all()
    await db_session.commit()

    response = [
        TagResponse(
            name=r.name,
            tag_id=tag_seq_to_id(r.tag_seq),
        page_priority=r.page_priority,
                contents=r.contents,
            )for r in tags
    ]
    return response


@router.delete('/{tag_type}/{tag_id}/{type_id}')
async def delete_tag_type(
        tag_type: TagType,
        tag_id: str,
        type_id: str,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)
):
    """Delete an existing tag associated with a specified model type."""
    validate_roles(role=roles.tag_delete, auth_roles=profile.auth_roles)

    type_model = get_model_type(tag_type)
    model_of_type_model = get_model_of_model_type(tag_type)
    type_id_to_seq = get_type_id_to_seq(tag_type)
    model_type_seq_col = get_model_type_seq_col(tag_type)

    tag_seq = tag_id_to_seq(tag_id)
    type_seq = type_id_to_seq(type_id)

    model_exists = (await db_session.exec(
        select(model_of_type_model)
        .where(model_type_seq_col == type_seq)
    )).first()

    if model_exists:
        stmt = (
            delete(type_model)
            .where(type_model.tag_seq == tag_seq)
            .where(type_model.type_seq == type_seq)
        )
        result = await db_session.exec(stmt)

        if result.rowcount == 0:
            raise HTTPException(
                HTTPStatus.NOT_FOUND,
                detail=f"{tag_type} tag not found.",
            )
        await db_session.commit()
        return {"message": f"{tag_type} tag deleted successfully."}
    else:
        raise HTTPException(
            HTTPStatus.FORBIDDEN,
            detail=f"You are not authorized to delete {tag_type} tag.",
        )


@router.get('/{tag_type}/top')
async def get_top_tags_for_type(
        tag_type: TagType,
        profile: Optional[Profile] = Depends(maybe_session_profile),
        limit: int = Query(1, le=100),
        offset: int = 0,
):
    type_model = get_model_type(tag_type)
    if tag_type == TagType.file:
        if not profile:
            raise HTTPException(
                HTTPStatus.FORBIDDEN,
                detail="You must be logged into the system to enrich files."
            )

    top_tag_subquery = (
        select(
            type_model.tag_seq,
            func.count(col(type_model.tag_seq))  # pylint: disable=not-callable
            .label("tag_count"),
        )
        .group_by(type_model.tag_seq)
        .order_by(
            func.count(col(type_model.tag_seq)).desc(),  # pylint: disable=not-callable
            col(type_model.tag_seq).desc(),
        )
        .limit(limit)
        .offset(offset)
    ).subquery()

    query = (
        select(Tag)
        .join(
            top_tag_subquery, Tag.tag_seq == top_tag_subquery.c.tag_seq
        )
        .order_by(
            col(top_tag_subquery.c.tag_count).desc(),
            col(Tag.tag_seq).desc(),  # pylint: disable=no-member
        )
    )

    tags = (await db_session.exec(query)).all()

    response = [
        TagResponse(
            name=tag.name,
            tag_id=tag_seq_to_id(tag.tag_seq),
        page_priority=tag.page_priority,
                contents=tag.contents,
            )for tag in tags
    ]

    return response


@router.get('/{tag_type}/filter')
async def get_filtered_model_types_by_tags(
        tag_type: TagType,
        profile: Optional[Profile] = Depends(maybe_session_profile),
        limit: int = Query(1, le=100),
        offset: int = 0,
        include: list[str] = Query(None),
        exclude: list[str] = Query(None),
        db_session: AsyncSession = Depends(get_db_session)
):
    if tag_type == TagType.file:
        if not profile:
            raise HTTPException(
                HTTPStatus.FORBIDDEN,
                detail="You must be logged into the system to enrich files."
            )

    type_model = get_model_type(tag_type)
    model_of_type_model = get_model_of_model_type(tag_type)
    model_type_seq_col = get_model_type_seq_col(tag_type)

    query = select(model_of_type_model)

    if include:
        include_assets_subquery = (
            select(col(model_type_seq_col).distinct().label("asset_seq"))
            .join(type_model, type_model.type_seq == model_type_seq_col)
            .join(Tag, type_model.tag_seq == Tag.tag_seq)
            .where(Tag.name.in_(include))  # pylint: disable=no-member
        ).subquery()

        query = query.join(
            include_assets_subquery,
            model_type_seq_col == include_assets_subquery.c.asset_seq,
        )

    if exclude:
        exclude_assets_subquery = (
            select(
                col(model_type_seq_col)  # pylint: disable=no-member
                .distinct()  # pylint: disable=no-member
                .label("asset_seq")
            )
            .join(type_model, type_model.type_seq == model_type_seq_col)
            .join(Tag, type_model.tag_seq == Tag.tag_seq)
            .where(Tag.name.in_(exclude))  # pylint: disable=no-member
        ).subquery()

        query = query.outerjoin(
            exclude_assets_subquery,
            model_type_seq_col == exclude_assets_subquery.c.asset_seq,
        )
        query = query.where(exclude_assets_subquery.c.asset_seq == None)

    query = query.order_by(
        model_type_seq_col.desc()  # pylint: disable=no-member
    )
    return await process_type_model_result(tag_type, db_session, query, profile, limit, offset)
