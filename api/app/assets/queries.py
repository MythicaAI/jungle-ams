# pylint: disable=no-member, unsupported-membership-test

import json
from functools import lru_cache
from typing import Callable, Iterable, Optional, Union

from cryptid.cryptid import tag_seq_to_id
from db.schema.assets import Asset, AssetTag, AssetVersion
from db.schema.media import FileContent
from db.schema.profiles import Org, Profile, ProfileAsset
from db.schema.tags import Tag
from sqlalchemy import (
    Select,
    String,
    Subquery,
    Tuple,
    and_,
    case,
    cast,
    desc,
    func,
    or_,
)
from sqlalchemy.orm import aliased
from sqlalchemy.sql import cast, func
from sqlmodel import Session, col, func, select
from sqlmodel.ext.asyncio.session import AsyncSession
from tags.tag_models import TagResponse, TagType, get_model_type, get_model_type_seq_col


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


@lru_cache
def build_lpad_function(db_session: AsyncSession) -> Callable:
    if db_session.bind.name == 'postgresql':
        return func.lpad
    elif db_session.bind.name == 'sqlite':
        # Define a SQL function for LPAD
        def sqlite_lpad(value, length, pad_char):
            return func.substr(pad_char * length + value, -length, length)
        return sqlite_lpad


@lru_cache
def build_concat_function(db_session: AsyncSession) -> Callable:
    from sqlalchemy.sql.functions import _FunctionGenerator
    if db_session.bind.dialect.name == 'postgresql':
        return func.concat
    elif db_session.bind.dialect.name == 'sqlite':
        def sqlite_concat(*args: tuple[_FunctionGenerator]):
            expr = args[0]
            for arg in args[1:]:
                expr = expr.op("||")(arg)
            return expr
        return sqlite_concat

def get_tag_join_query(db_session: AsyncSession) -> Select[Tuple]:
    json_func = build_json_function(db_session)
    json_agg_func = build_json_agg_function(db_session)

    return (
        select(
            AssetTag.type_seq.label('asset_seq'),  # pylint: disable=no-member
            json_agg_func(
                json_func(
                    'tag_seq',
                    AssetTag.tag_seq,
                    'name',
                    Tag.name,
                    'page_priority',
                    Tag.page_priority,
                    'contents',
                    Tag.contents,
                )
            ).label('tag_to_asset'),
        )
        .join(Tag, Tag.tag_seq == AssetTag.tag_seq)
        .group_by(AssetTag.type_seq)
    )


def get_tag_subquery(db_session: AsyncSession) -> Subquery:
    return get_tag_join_query(db_session).subquery()


OwnerProfile = aliased(Profile)
AuthorProfile = aliased(Profile)


async def get_top_published_assets_metadata_query(
    db_session: AsyncSession,
) -> Iterable[
    tuple[Asset, AssetVersion, FileContent, dict[str, Union[int, str]], str, str, str]
]:
    tag_subquery = get_tag_subquery(db_session)
    query = (
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
    return (await db_session.exec(query)).all()


async def exec_query_owned_versions(
    db_session: AsyncSession, profile_seq: int
) -> Iterable[
    tuple[Asset, Optional[AssetVersion], dict[str, Union[int, str]], str, str, str]
]:
    tag_subquery = get_tag_subquery(db_session)
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .where(Asset.owner_seq == profile_seq)
        .where(case((AssetVersion != None, AssetVersion.deleted == None), else_=True))
        .where(Asset.deleted == None)
        .order_by(Asset.asset_seq)
    )
    return (await db_session.exec(query)).all()


async def exec_query_assets_by_asset_name(
    db_session: AsyncSession, asset_name: str
) -> Iterable[
    tuple[Asset, Optional[AssetVersion], dict[str, Union[int, str]], str, str, str]
]:
    tag_subquery = get_tag_subquery(db_session)
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .where(AssetVersion.name == asset_name)
        .where(case((AssetVersion != None, AssetVersion.deleted == None), else_=True))
        .where(Asset.deleted == None)
        .order_by(Asset.asset_seq)
    )
    return (await db_session.exec(query)).all()


async def exec_query_assets_by_commit_ref(
    db_session: AsyncSession, commit_ref: str
) -> Iterable[
    tuple[Asset, Optional[AssetVersion], dict[str, Union[int, str]], str, str, str]
]:
    tag_subquery = get_tag_subquery(db_session)
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .where(col(AssetVersion.commit_ref).contains(commit_ref))
        .where(case((AssetVersion != None, AssetVersion.deleted == None), else_=True))
        .where(Asset.deleted == None)
        .order_by(Asset.asset_seq)
    )
    return (await db_session.exec(query)).all()


async def exec_query_assets_by_asset_seq(
    db_session: AsyncSession, asset_seq: int
) -> Iterable[
    tuple[Asset, Optional[AssetVersion], dict[str, Union[int, str]], str, str, str]
]:
    tag_subquery = get_tag_subquery(db_session)
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .where(Asset.asset_seq == asset_seq)
        .where(case((AssetVersion != None, AssetVersion.deleted == None), else_=True))
        .where(Asset.deleted == None)
        .order_by(
            desc(AssetVersion.major), desc(AssetVersion.minor), desc(AssetVersion.patch)
        )
    )
    return (await db_session.exec(query)).all()


async def exec_query_select_asset_version(
    db_session: AsyncSession, asset_seq: int, version: tuple[int, ...]
) -> Iterable[
    tuple[Asset, Optional[AssetVersion], dict[str, Union[int, str]], str, str, str]
]:
    tag_subquery = get_tag_subquery(db_session)
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(
            AssetVersion,
            (Asset.asset_seq == AssetVersion.asset_seq)
            & (AssetVersion.major == version[0])
            & (AssetVersion.minor == version[1])
            & (AssetVersion.patch == version[2]),
        )
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .where(Asset.asset_seq == asset_seq)
        .where(AssetVersion.deleted == None)
        .where(Asset.deleted == None)
    )
    return (await db_session.exec(query)).all()


async def exec_query_select_asset_latest_version(
    db_session: AsyncSession, asset_seq: int
) -> Optional[
    tuple[Asset, Optional[AssetVersion], dict[str, Union[int, str]], str, str, str]
]:
    tag_subquery = get_tag_subquery(db_session)
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .where(Asset.asset_seq == asset_seq)
        .where(case((AssetVersion != None, AssetVersion.deleted == None), else_=True))
        .where(Asset.deleted == None)
        .order_by(
            desc(AssetVersion.major), desc(AssetVersion.minor), desc(AssetVersion.patch)
        )
    )
    return (await db_session.exec(query)).first()


async def exec_query_select_asset_by_version(
    db_session: AsyncSession,
    asset_seq: int,
    major: int,
    minor: int,
    patch: int,
) -> Iterable[
    Optional[
        tuple[Asset, Optional[AssetVersion], dict[str, Union[int, str]], str, str, str]
    ]
]:
    tag_subquery = get_tag_subquery(db_session)
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .where(case((AssetVersion != None, AssetVersion.deleted == None), else_=True))
        .where(Asset.deleted == None)
        .where(Asset.asset_seq == asset_seq)
        .where(AssetVersion.major == major)
        .where(AssetVersion.minor == minor)
        .where(AssetVersion.patch == patch)
    )
    return (await db_session.exec(query)).all()


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
                json.loads(tag.get("contents"))
                if isinstance(tag.get("contents"), str) and tag.get("contents") != "null"
                else None
            ),
        )
        for tag in tags_to_asset
    ]


async def exec_query_select_assets_by_profile_asset_category(
    db_session: AsyncSession,
    profile_seq: int,
    category: Optional[str],
) -> Iterable[
    Optional[
        tuple[Asset, Optional[AssetVersion], dict[str, Union[int, str]], str, str, str]
    ]
]:
    tag_subquery = get_tag_subquery(db_session)
    lpad_func = build_lpad_function(db_session)
    concat_func = build_concat_function(db_session)

    # Subquery to find the latest version for each asset
    latest_version_subquery = (
        select(
            AssetVersion.asset_seq,
            func.max(
                concat_func(  # pylint: disable=not-callable
                    lpad_func(cast(AssetVersion.major, String), 3, '0'),
                    lpad_func(cast(AssetVersion.minor, String), 3, '0'),
                    lpad_func(cast(AssetVersion.patch, String), 3, '0')  # pylint: disable=not-callable
                )
            ).label('max_version'),
        )
        .group_by(AssetVersion.asset_seq)
        .subquery()
    )

    # Main query to select assets with the latest version or specific version
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
            # latest_version_subquery.c.max_version,
        )
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(ProfileAsset, Asset.asset_seq == ProfileAsset.asset_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .outerjoin(
            latest_version_subquery,
            latest_version_subquery.c.asset_seq == Asset.asset_seq,
        )
        .outerjoin(
            AssetVersion,
            and_(
                Asset.asset_seq == AssetVersion.asset_seq,
                or_(
                    and_(
                        ProfileAsset.major == 0,
                        ProfileAsset.minor == 0,
                        ProfileAsset.patch == 0,
                        concat_func(
                            lpad_func(cast(AssetVersion.major, String), 3, '0'),
                            lpad_func(cast(AssetVersion.minor, String), 3, '0'),
                            lpad_func(cast(AssetVersion.patch, String), 3, '0')  # pylint: disable=not-callable
                        )
                        == latest_version_subquery.c.max_version,
                    ),
                    and_(
                        ProfileAsset.major == AssetVersion.major,
                        ProfileAsset.minor == AssetVersion.minor,
                        ProfileAsset.patch == AssetVersion.patch,
                    ),
                ),
            ),
        )
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .where(ProfileAsset.profile_seq == profile_seq)
        .where(Asset.deleted == None)
    )

    if category:
        query = query.where(ProfileAsset.category == category)

    return (await db_session.exec(query)).all()


async def get_list_all_assets_query(
    db_session: AsyncSession,
) -> list[tuple[Asset, AssetVersion, dict[str, Union[int, str]], str, str, str]]:
    tag_subquery = get_tag_subquery(db_session)
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .where(Asset.deleted == None, AssetVersion.deleted == None)
    )
    return (await db_session.exec(query)).all()


async def get_filtered_assets_by_tags_query(
    db_session: AsyncSession,
    tag_subquery: Subquery,
    limit: int,
    offset: int,
) -> list[tuple[Asset, AssetVersion, dict[str, Union[int, str]], str, str, str]]:
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .where(Asset.deleted == None, AssetVersion.deleted == None)
        .where(tag_subquery.c.tag_to_asset != None)
        .order_by(
            desc(AssetVersion.major),
            desc(AssetVersion.minor),
            desc(AssetVersion.patch),
        )
        .limit(limit)
        .offset(offset)
    )
    return (await db_session.exec(query)).all()


async def get_tag_name_filter_query(
    db_session: AsyncSession,
    include: Optional[list[str]],
    exclude: Optional[list[str]],
    tag_type: TagType,
) -> Select:
    type_model = get_model_type(tag_type)
    # model_of_type_model = get_model_of_model_type(tag_type)
    model_type_seq_col = get_model_type_seq_col(tag_type)

    if tag_type == TagType.asset:
        query = get_tag_join_query(db_session)
    elif tag_type == TagType.file:
        query = select(FileContent)

    if include:
        include_assets_subquery = select(
            col(type_model.type_seq).distinct().label("asset_seq")
        )
        if tag_type == TagType.file:
            include_assets_subquery = select(
                col(model_type_seq_col).distinct().label("asset_seq")
            ).join(type_model, type_model.type_seq == model_type_seq_col)

        include_assets_subquery = (
            include_assets_subquery.join(Tag, type_model.tag_seq == Tag.tag_seq).where(
                Tag.name.in_(include)
            )  # pylint: disable=no-member
        ).subquery()

        if tag_type == TagType.file:
            query = query.join(
                include_assets_subquery,
                model_type_seq_col == include_assets_subquery.c.asset_seq,
            )
        elif tag_type == TagType.asset:
            query = query.join(
                include_assets_subquery,
                type_model.type_seq == include_assets_subquery.c.asset_seq,
            )

    if exclude:
        exclude_assets_subquery = select(
            col(type_model.type_seq)  # pylint: disable=no-member
            .distinct()  # pylint: disable=no-member
            .label("asset_seq")
        )
        if tag_type == TagType.file:
            exclude_assets_subquery = select(
                col(model_type_seq_col)  # pylint: disable=no-member
                .distinct()  # pylint: disable=no-member
                .label("asset_seq")
            ).join(type_model, type_model.type_seq == model_type_seq_col)

        exclude_assets_subquery = (
            exclude_assets_subquery.join(Tag, type_model.tag_seq == Tag.tag_seq).where(
                Tag.name.in_(exclude)
            )  # pylint: disable=no-member
        ).subquery()

        if tag_type == TagType.file:
            query = query.outerjoin(
                exclude_assets_subquery,
                model_type_seq_col == exclude_assets_subquery.c.asset_seq,
            )
        elif tag_type == TagType.asset:
            query = query.outerjoin(
                exclude_assets_subquery,
                AssetTag.type_seq == exclude_assets_subquery.c.asset_seq,
            )
        query = query.where(exclude_assets_subquery.c.asset_seq == None)

    if tag_type == TagType.file:
        query = query.order_by(desc(FileContent.file_seq))  # pylint: disable=no-member
    elif tag_type == TagType.asset:
        query = query.order_by(desc(AssetTag.type_seq))  # pylint: disable=no-member

    return query


async def get_filtered_assets_by_tags_query2(
    db_session: AsyncSession,
    tag_subquery: Subquery,
    limit: int,
    offset: int,
) -> list[tuple[Asset, AssetVersion, dict[str, Union[int, str]], str, str, str]]:
    query = (
        select(
            Asset,
            AssetVersion,
            tag_subquery.c.tag_to_asset,
            OwnerProfile.name,
            AuthorProfile.name,
            Org.name,
        )
        .outerjoin(AssetVersion, Asset.asset_seq == AssetVersion.asset_seq)
        .outerjoin(OwnerProfile, OwnerProfile.profile_seq == Asset.owner_seq)
        .outerjoin(AuthorProfile, AuthorProfile.profile_seq == AssetVersion.author_seq)
        .outerjoin(Org, Org.org_seq == Asset.org_seq)
        .outerjoin(tag_subquery, tag_subquery.c.asset_seq == Asset.asset_seq)
        .where(Asset.deleted == None, AssetVersion.deleted == None)
        .order_by(
            desc(AssetVersion.major),
            desc(AssetVersion.minor),
            desc(AssetVersion.patch),
        )
        .limit(limit)
        .offset(offset)
    )
    return (await db_session.exec(query)).all()
