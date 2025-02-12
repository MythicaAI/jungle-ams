# pylint: disable=no-member, unsupported-membership-test

import json
from functools import lru_cache
from typing import Callable, Union

from sqlalchemy.orm import aliased
from sqlmodel import Session, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from cryptid.cryptid import tag_seq_to_id
from db.schema.assets import Asset, AssetTag, AssetVersion
from db.schema.media import FileContent
from db.schema.profiles import Org, Profile
from db.schema.tags import Tag

from tags.tag_models import TagResponse


@lru_cache
def build_json_function(db_session: AsyncSession) -> Callable:
    if db_session.bind.name == 'postgresql':
        return func.json_build_object
    elif db_session.bind.name == 'sqlite':
        return func.json_object


@lru_cache
def build_json_agg_function(session: Session) -> Callable:
    if session.bind.name == 'postgresql':
        return func.json_agg
    elif session.bind.name == 'sqlite':
        return func.json_group_array


def get_tag_subquery(db_session: AsyncSession) -> select:
    json_func = build_json_function(db_session)
    json_agg_func = build_json_agg_function(db_session)

    return (
        select(
            AssetTag.type_seq.label('asset_seq'),  # pylint: disable=no-member
            json_agg_func(
                json_func(
                    'tag_seq', AssetTag.tag_seq,
                    'name', Tag.name,
                    'page_priority', Tag.page_priority,
                    'contents', Tag.contents,
                )
            ).label('tag_to_asset'),
        )
        .join(Tag, Tag.tag_seq == AssetTag.tag_seq)
        .group_by(AssetTag.type_seq)
        .subquery()
    )


OwnerProfile = aliased(Profile)
AuthorProfile = aliased(Profile)


async def get_top_published_assets_metadata_query(db_session: AsyncSession):
    tag_subquery = await get_tag_subquery(db_session)
    top_published_assets_metadata_query = (
        select(
            Asset,
            AssetVersion,
            FileContent,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(FileContent, FileContent.file_seq == AssetVersion.package_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .where(AssetVersion.published == True)
        .where(AssetVersion.package_seq != None)
        .where(Asset.deleted == None, AssetVersion.deleted == None)
    )
    return session.exec(top_published_assets_metadata_query).all()


def resolve_assets_tag(
        tags_to_asset: list[dict[str, Union[int, str]]]
) -> list | list[dict[str, str]]:
    if isinstance(tags_to_asset, str):
        tags_to_asset = json.loads(tags_to_asset)
    if not tags_to_asset:
        return []
    return [
        TagResponse(
            name=tag.get("name"),
            tag_id=tag_seq_to_id(tag.get("tag_seq")),
            page_priority=tag.get("page_priority"),
            contents=(
                tag.get("contents")
                if tag.get("contents") != "null"  # if sqlite column value
                else None
            ),
        )
        for tag in tags_to_asset
    ]
