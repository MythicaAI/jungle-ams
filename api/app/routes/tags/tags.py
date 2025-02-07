"""API routing layer and logic for tag management"""

import logging
from http import HTTPStatus
from typing import Optional

from cryptid.cryptid import (
    file_id_to_seq,
    tag_id_to_seq,
    tag_seq_to_id,
)
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from ripple.auth import roles
from ripple.auth.authorization import validate_roles
from ripple.models.sessions import SessionProfile
from sqlalchemy import Sequence, asc, desc
from sqlalchemy.exc import IntegrityError
from sqlmodel import delete as sql_delete, insert, select

from content.locate_content import locate_content_by_seq
from db.connection import get_session
from db.schema.tags import Tag
from routes.authorization import session_profile
from routes.tags.tag_types import router as tag_types_router
from tags.tag_models import TagRequest, TagResponse

log = logging.getLogger(__name__)

router = APIRouter(prefix='/tags', tags=['tags'])
router.include_router(tag_types_router)


@router.post('/', status_code=HTTPStatus.CREATED)
async def create(
        create_req: TagRequest,
        response: Response,
        profile: SessionProfile = Depends(session_profile)
) -> TagResponse:
    """Create a tag"""
    with get_session() as session:
        validate_roles(role=roles.tag_create, auth_roles=profile.auth_roles)
        
        if create_req.contents is not None and create_req.contents.get("thumbnail_id"):
            file_id = create_req.contents.get("thumbnail_id")
            db_file = locate_content_by_seq(session, file_id_to_seq(file_id))
            if db_file is None:
                raise HTTPException(HTTPStatus.NOT_FOUND,
                                    detail=f"file '{file_id}' not found")
        try:
            session.exec(
                insert(Tag).values(
                    name=create_req.name,
                    owner_seq=profile.profile_seq,  # record authorship
                    page_priority=create_req.page_priority,
                    contents=create_req.contents,
                    )
            )
            session.commit()
        except IntegrityError:
            session.rollback()
            log.info("tag exists: %s", create_req.name)
            response.status_code = HTTPStatus.OK

        result = session.exec(select(Tag).where(Tag.name == create_req.name)).one_or_none()
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
async def delete(name: str, profile: SessionProfile = Depends(session_profile)):
    """Delete an existing tag"""
    with get_session() as session:
        validate_roles(role=roles.tag_delete, auth_roles=profile.auth_roles)
        stmt = (
            sql_delete(Tag)
            .where(Tag.name == name))
        session.execute(stmt)
        session.commit()


@router.get('/')
async def list_all(limit: int = Query(1, le=100), offset: int = 0) -> list[TagResponse]:
    """Get all tags"""
    with get_session() as session:
        rows: Sequence[Tag] = session.exec(
            select(Tag).order_by(asc(Tag.page_priority), desc(Tag.created)).limit(limit).offset(offset)
        ).all()

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
async def by_id(tag_id: str) -> Optional[TagResponse]:
    """Get tag by id"""
    with get_session() as session:
        result: Tag = session.exec(
            select(Tag).where(Tag.tag_seq == tag_id_to_seq(tag_id))
        ).one_or_none()

        return TagResponse(
            name=result.name,
            tag_id=tag_id,
            page_priority=result.page_priority,
            contents=result.contents,
        ) if result else None
