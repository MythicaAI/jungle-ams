"""Utils for models types"""

from typing import Callable, Optional

from sqlalchemy import Select, desc
from sqlmodel import Session
from fastapi import HTTPException

import assets.repo as assets_repo

import auth.roles
from auth.authorization import Scope, validate_roles
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
        files: list[FileContent] = session.exec(
            type_model_query.where(FileContent.deleted == None)
        ).all()
        accessible_files = []
        for file in files:
            try:
                if not file.visibility == "public":
                    validate_roles(role=auth.roles.file_get,
                                object_id=file.visibility, auth_roles=profile.auth_roles,
                                scope=Scope(profile=profile, file=file))
                accessible_files.append(file)
            except HTTPException:
                pass
        return enrich_files(session, accessible_files, profile)
