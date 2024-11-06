"""API routing layer and logic for tag management"""

import logging
from datetime import timezone
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import delete as sql_delete, insert, select

import auth.roles
from auth.authorization import Test, validate_roles
from cryptid.cryptid import (
    profile_seq_to_id,
    tag_seq_to_id,
)
from db.connection import TZ, get_session
from db.schema.profiles import Profile
from db.schema.tags import Tag
from routes.authorization import session_profile_roles
from routes.tags.tag_models import TagRequest, TagResponse
from routes.tags.tag_types import router as tag_types_router

log = logging.getLogger(__name__)

router = APIRouter(prefix='/tags', tags=['tags'])
router.include_router(tag_types_router)


@router.post('/', status_code=HTTPStatus.CREATED)
async def create(
        create: TagRequest, profile_roles: Profile = Depends(session_profile_roles)
) -> TagResponse:
    """Create a tag"""
    with get_session() as session:
        profile, roles = profile_roles
        validate_roles(Test(role=auth.roles.tag_create), roles)

        try:
            session.exec(
                insert(Tag).values(
                    name=create.name,
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

        result = session.exec(select(Tag).where(Tag.name == create.name)).one_or_none()
        if result is None:
            raise HTTPException(
                HTTPStatus.INTERNAL_SERVER_ERROR, detail="failed to create tag"
            )
        return TagResponse(
            name=create.name,
            tag_id=tag_seq_to_id(result.tag_seq),
            owner_id=profile_seq_to_id(profile.profile_seq),
            created=result.created.replace(tzinfo=TZ).astimezone(timezone.utc),
        )


@router.delete('/{name}')
async def delete(name: str, profile_roles: Profile = Depends(session_profile_roles)):
    """Delete an existing tag"""
    with get_session() as session:
        profile, roles = profile_roles
        validate_roles(Test(role=auth.roles.tag_delete), roles)
        stmt = (
            sql_delete(Tag)
            .where(Tag.name == name)
            .where(Tag.owner_seq == profile.profile_seq)
        )
        session.execute(stmt)
        session.commit()


@router.get('/')
async def list(limit: int = Query(1, le=100), offset: int = 0) -> list[TagResponse]:
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
