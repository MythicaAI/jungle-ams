"""API routing layer and logic for tag management"""

import logging
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import Sequence, asc, desc
from sqlalchemy.exc import IntegrityError
from sqlmodel import delete as sql_delete, insert, select, update as sql_update
from sqlmodel.ext.asyncio.session import AsyncSession

from cryptid.cryptid import tag_id_to_seq, tag_seq_to_id
from db.connection import get_db_session
from db.schema.tags import Tag
from ripple.auth import roles
from ripple.auth.authorization import validate_roles
from ripple.models.sessions import SessionProfile
from routes.authorization import session_profile
from routes.tags.tag_types import router as tag_types_router
from tags.repo import resolve_contents_as_json
from tags.tag_models import TagRequest, TagResponse, TagUpdateRequest

log = logging.getLogger(__name__)

router = APIRouter(prefix='/tags', tags=['tags'])
router.include_router(tag_types_router)


@router.post('/', status_code=HTTPStatus.CREATED)
async def create(
        create_req: TagRequest,
        response: Response,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)
) -> TagResponse:
    """Create a tag"""
    validate_roles(role=roles.tag_create, auth_roles=profile.auth_roles)

    if create_req.contents:
        create_req.contents = await resolve_contents_as_json(db_session, create_req.contents)
    try:
        await db_session.exec(
            insert(Tag).values(
                name=create_req.name,
                owner_seq=profile.profile_seq,  # record authorship
                page_priority=create_req.page_priority,
                contents=create_req.contents,
            )
        )
        await db_session.commit()
    except IntegrityError:
        await db_session.rollback()
        log.info("tag exists: %s", create_req.name)
        response.status_code = HTTPStatus.OK

    result = (await db_session.exec(select(Tag).where(Tag.name == create_req.name))).one_or_none()
    if result is None:
        raise HTTPException(
            HTTPStatus.INTERNAL_SERVER_ERROR, detail="failed to create tag"
        )
    return TagResponse(
        name=create_req.name,
        tag_id=tag_seq_to_id(result.tag_seq),
        page_priority=result.page_priority,
        contents=result.contents,
    )


@router.delete('/{name}')
async def delete(
        name: str,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)):
    """Delete an existing tag"""
    validate_roles(role=roles.tag_delete, auth_roles=profile.auth_roles)
    stmt = (
        sql_delete(Tag)
        .where(Tag.name == name))
    await db_session.exec(stmt)
    await db_session.commit()


@router.get('/')
async def list_all(
        limit: int = Query(1, le=100),
        offset: int = 0,
        db_session: AsyncSession = Depends(get_db_session)) -> list[TagResponse]:
    """Get all tags"""
    rows: Sequence[Tag] = (await db_session.exec(
        select(Tag).where(
            Tag.page_priority > 0
        ).order_by(
            asc(Tag.page_priority), desc(Tag.created)
        ).limit(limit).offset(offset)
    )).all()

    response = [
        TagResponse(
            name=r.name,
            tag_id=tag_seq_to_id(r.tag_seq),
            page_priority=r.page_priority,
            contents=r.contents,
        )
        for r in rows
    ]
    return response


@router.get('/{tag_id}')
async def by_id(
        tag_id: str,
        db_session: AsyncSession = Depends(get_db_session)) -> Optional[TagResponse]:
    """Get tag by id"""
    result: Tag = (await db_session.exec(
        select(Tag).where(Tag.tag_seq == tag_id_to_seq(tag_id))
    )).one_or_none()

    return TagResponse(
        name=result.name,
        tag_id=tag_id,
        page_priority=result.page_priority,
        contents=result.contents,
    ) if result else None


@router.post('/{tag_id}')
async def update(
        tag_id: str,
        req: TagUpdateRequest,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)
) -> TagResponse:
    """Update an existing tag"""
    validate_roles(role=roles.tag_update, auth_roles=profile.auth_roles)
    if req.contents:
        req.contents = await resolve_contents_as_json(db_session, req.contents)
    tag_seq = tag_id_to_seq(tag_id)
    tag = (await db_session.exec(select(Tag).where(Tag.tag_seq == tag_seq))).first()
    if tag is None:
        raise HTTPException(HTTPStatus.NOT_FOUND,
                            f"tag: {tag_id} not found")

    r = await db_session.exec(sql_update(Tag).where(
        Tag.tag_seq == tag_seq).values(
        **req.model_dump(exclude_unset=True)))
    if r.rowcount == 0:
        raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                            f"update for: {tag_id} failed")
    await db_session.commit()
    await db_session.refresh(tag)
    result = TagResponse(tag_id=tag_seq_to_id(tag.tag_seq),
                         **tag.model_dump())
    return result
