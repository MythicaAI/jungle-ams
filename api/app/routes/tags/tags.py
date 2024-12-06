"""API routing layer and logic for tag management"""

import logging
from datetime import timezone
from http import HTTPStatus

from cryptid.cryptid import (
    profile_seq_to_id,
    tag_seq_to_id,
)
from fastapi import APIRouter, Depends, HTTPException, Query
from ripple.auth import roles
from ripple.auth.authorization import validate_roles
from ripple.models.sessions import SessionProfile
from sqlalchemy.exc import IntegrityError
from sqlmodel import delete as sql_delete, insert, select

from db.connection import TZ, get_session
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
        profile: SessionProfile = Depends(session_profile)
) -> TagResponse:
    """Create a tag"""
    with get_session() as session:
        validate_roles(role=roles.tag_create, auth_roles=profile.auth_roles)

        try:
            session.exec(
                insert(Tag).values(
                    name=create_req.name,
                    owner_seq=profile.profile_seq,
                )
            )
            session.commit()
        except IntegrityError as ex:
            session.rollback()
            log.error("create_tag error: %s", str(ex))
            raise HTTPException(
                HTTPStatus.CONFLICT,
                detail="The tag with the provided name already exists.",
            ) from ex

        result = session.exec(select(Tag).where(Tag.name == create_req.name)).one_or_none()
        if result is None:
            raise HTTPException(
                HTTPStatus.INTERNAL_SERVER_ERROR, detail="failed to create tag"
            )
        return TagResponse(
            name=create_req.name,
            tag_id=tag_seq_to_id(result.tag_seq),
            owner_id=profile_seq_to_id(profile.profile_seq),
            created=result.created.replace(tzinfo=TZ).astimezone(timezone.utc),
        )


@router.delete('/{name}')
async def delete(name: str, profile: SessionProfile = Depends(session_profile)):
    """Delete an existing tag"""
    with get_session() as session:
        validate_roles(role=roles.tag_delete, auth_roles=profile.auth_roles)
        stmt = (
            sql_delete(Tag)
            .where(Tag.name == name)
            .where(Tag.owner_seq == profile.profile_seq)
        )
        session.execute(stmt)
        session.commit()


@router.get('/')
async def list_all(limit: int = Query(1, le=100), offset: int = 0) -> list[TagResponse]:
    """Get all tags"""
    with get_session() as session:
        rows = session.exec(select(Tag).limit(limit).offset(offset)).all()

        response = [
            TagResponse(
                name=r.name,
                tag_id=tag_seq_to_id(r.tag_seq),
                owner_id=profile_seq_to_id(r.owner_seq),
                created=r.created.replace(tzinfo=TZ).astimezone(timezone.utc),
            )
            for r in rows
        ]
        return response
