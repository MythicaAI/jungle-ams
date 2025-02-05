# pylint: disable=no-member, unsupported-membership-test

from typing import Union
from db.schema.assets import Asset, AssetTag, AssetVersion
from db.schema.media import FileContent
from db.schema.profiles import Org, Profile
from db.schema.tags import Tag
from sqlalchemy.orm import aliased
from cryptid.cryptid import tag_seq_to_id
from sqlmodel import func, select

tag_subquery = (
    select(
        AssetTag.type_seq.label('asset_seq'),  # pylint: disable=no-member
        func.json_agg(
            func.json_build_object('tag_seq', AssetTag.tag_seq, 'tag_name', Tag.name)
        ).label('tag_to_asset'),
    )
    .join(Tag, Tag.tag_seq == AssetTag.tag_seq)
    .group_by(AssetTag.type_seq)
    .subquery()
)

OwnerProfile = aliased(Profile)
AuthorProfile = aliased(Profile)

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


def resolve_assets_tag(
    tags_to_asset: dict[str, Union[int, str]]
) -> list | list[dict[str, str]]:
    if not tags_to_asset:
        return []
    return [
        {
            "tag_id": tag_seq_to_id(tag["tag_seq"]),
            "tag_name": tag["tag_name"],
        }
        for tag in tags_to_asset
    ]
