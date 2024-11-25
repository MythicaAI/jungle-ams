"""Utils for models types"""

from typing import Callable, Optional

from sqlalchemy import Select, desc
from sqlmodel import Session

import assets.repo as assets_repo

from db.schema.assets import Asset, AssetVersion
from db.schema.media import FileContent
from db.schema.profiles import Profile
from routes.file_uploads import enrich_files
from tags.tag_models import TagType



def process_type_model_result(
        tag_type: TagType,
        session: Session,
        type_model_query: Optional[Select],
        profile: Optional[Profile],
        limit: int,
        offset: int,
) -> Callable:
    "Dynamically return the type_model response"
    if tag_type == TagType.asset:
        subquery = type_model_query.subquery()
        query = (
            assets_repo.asset_join_select
            .where(AssetVersion.published == True)
            .join(subquery, Asset.asset_seq == subquery.c.asset_seq)
            .order_by(
                desc(AssetVersion.major),
                desc(AssetVersion.minor),
                desc(AssetVersion.patch),
            )
            .limit(limit)
            .offset(offset)
        )
        results = session.exec(query)
        return assets_repo.process_join_results(session, results)
    elif tag_type == TagType.file:

        files = session.exec(
            type_model_query.where(FileContent.deleted == None)
        ).all()
        return enrich_files(session, files, profile)
