"""API routing layer and logic for key management"""

from enum import Enum
from datetime import datetime, timezone
from http import HTTPStatus
from typing import Callable

from better_profanity import profanity
from cryptid.cryptid import (
    asset_id_to_seq,
    profile_seq_to_id,
    tag_id_to_seq,
    tag_seq_to_id,
)
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator
from sqlalchemy import func
from sqlmodel import col, delete, insert, select

from db.connection import TZ, get_session
from db.schema.assets import AssetTag
from db.schema.profiles import Profile
from db.schema.tags import Tag
from routes.authorization import current_profile

router = APIRouter(prefix='/tags', tags=['tags'])


class TagType(str, Enum):
    asset = "asset"
    files = "files"


class TagRequest(BaseModel):
    name: str

    @field_validator('name')
    @classmethod
    def check_profanity(cls, name: str) -> str:
        if profanity.contains_profanity(name):
            raise ValueError("Tag name contains inappropriate language.")
        return name


class TagResponse(BaseModel):
    name: str
    tag_id: str
    owner_id: str = None
    created: datetime


class TagTypeRequest(BaseModel):
    tag_id: str
    type_id: str


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_tag(
    create: TagRequest, profile: Profile = Depends(current_profile)
) -> TagResponse:
    """Create a tag"""
    with get_session() as session:

        session.exec(
            insert(Tag).values(
                name=create.name,
                owner_seq=profile.profile_seq,
            )
        )

        session.commit()

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
async def delete_tag(name: str, profile: Profile = Depends(current_profile)):
    """Delete an existing tag"""
    with get_session() as session:
        stmt = (
            delete(Tag)
            .where(Tag.name == name)
            .where(Tag.owner_seq == profile.profile_seq)
        )
        session.execute(stmt)
        session.commit()


@router.get('/')
async def get_tags() -> list[TagResponse]:
    """Get all tags"""
    with get_session() as session:
        rows = session.exec(select(Tag)).all()

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


def get_model_type(tag_type: TagType) -> AssetTag:
    "Dynamically get the model class"
    model_map = {
        TagType.asset: AssetTag,
    }
    return model_map.get(tag_type)


def get_type_id_to_seq(tag_type: TagType) -> Callable:
    "Dynamically return the appropriate ID conversion function for a given tag type"
    if tag_type == TagType.asset:
        return asset_id_to_seq
    raise HTTPException(HTTPStatus.BAD_REQUEST, detail=f"Invalid tag type: {tag_type}")


@router.post('/{tag_type}', status_code=HTTPStatus.CREATED)
async def create_tag_for_type(
    tag_type: TagType,
    create: TagTypeRequest,
    profile: Profile = Depends(current_profile),  # pylint: disable=unused-argument
):
    values = create.model_dump()

    type_model = get_model_type(tag_type)
    type_id_to_seq = get_type_id_to_seq(tag_type)

    tag_seq = tag_id_to_seq(values["tag_id"])
    type_seq = type_id_to_seq(values["type_id"])

    insert_dict = {
        "tag_seq": tag_seq,
        f"{tag_type.value}_seq": type_seq,
    }

    with get_session() as session:
        create_result = session.exec(insert(type_model).values(**insert_dict))
        session.commit()

        if create_result.rowcount != 1:
            raise HTTPException(
                HTTPStatus.FORBIDDEN, detail=f"Failed to assign tag to {tag_type}"
            )

    return {"success": True, "tag_id": tag_seq, "type_id": type_seq}


@router.get('/{tag_type}')
async def get_tags_for_type(
    tag_type: TagType,
    profile: Profile = Depends(current_profile),  # pylint: disable=unused-argument
):

    type_model: AssetTag = get_model_type(tag_type)

    with get_session() as session:

        tags = session.exec(
            select(Tag).where(
                col(Tag.tag_seq).in_(  # pylint: disable=no-member
                    select(type_model.tag_seq).distinct()
                )
            )
        ).all()
        session.commit()

        response = [
            TagResponse(
                name=r.name,
                tag_id=tag_seq_to_id(r.tag_seq),
                owner_id=profile_seq_to_id(r.owner_seq),
                created=r.created.replace(tzinfo=TZ).astimezone(timezone.utc),
            )
            for r in tags
        ]
        return response


@router.get('/{tag_type}/top')
async def get_top_tags_for_type(
    tag_type: TagType,
    profile: Profile = Depends(current_profile),  # pylint: disable=unused-argument
    limit: int = Query(1, le=100),
):
    type_model: AssetTag = get_model_type(tag_type)

    with get_session() as session:
        top_tags = (
            session.exec(
                select(
                    func.count(  # pylint: disable=not-callable
                        col(type_model.tag_seq)
                    ).label("count")
                )
                .group_by(type_model.tag_seq)
                .order_by(
                    func.count(  # pylint: disable=not-callable
                        col(type_model.tag_seq)
                    ).desc()
                )
                .limit(limit)
            )
        ).all()

        tag_seqs = [tag.tag_seq for tag in top_tags]
        tags = session.exec(
            select(Tag).where(
                col(Tag.tag_seq).in_(tag_seqs)  # pylint: disable=no-member
            )
        ).all()

        response = [
            TagResponse(
                name=tag.name,
                tag_id=tag_seq_to_id(tag.tag_seq),
                owner_id=profile_seq_to_id(tag.owner_seq),
                created=tag.created.replace(tzinfo=TZ).astimezone(timezone.utc),
            )
            for tag in tags
        ]

        return response
