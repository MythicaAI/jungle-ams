"""
    This API module defines the /assets/g grouping API for consolidating
    groups of assets under a profile
"""
from http import HTTPStatus

import re
from cryptid.cryptid import asset_id_to_seq
from fastapi import APIRouter, Depends, HTTPException
from ripple.models.sessions import SessionProfile
from sqlmodel import Session, delete, insert, select
from typing import Optional

from assets import repo
from assets.repo import AssetVersionResult, convert_version_input
from db.connection import get_session
from db.schema.assets import Asset, AssetVersion
from db.schema.media import FileContent
from db.schema.profiles import ProfileAsset
from routes.authorization import session_profile

router = APIRouter(prefix="/assets/g", tags=["assets", "groups"])

MAX_CATEGORY_LEN = 63

# Regex for URL-safe characters
URL_SAFE_REGEX = re.compile(r"^[a-zA-Z0-9\-_\.]+$")


def filter_profile_assets(results):
    reduced = {}
    for r in results:
        asset_version = r[1]
        profile_asset = r[3]
        # select the latest version
        if profile_asset.major == 0 and profile_asset.minor == 0 and profile_asset.patch == 0:
            top_r = reduced.get(asset_version.asset_seq, None)
            if top_r is None:
                reduced[asset_version.asset_seq] = r
                continue

            top_asset_version = top_r[1]
            if asset_version.major < top_asset_version.major \
                    and asset_version.minor < top_asset_version.minor \
                    and asset_version.patch < top_asset_version.patch:
                continue

            reduced[asset_version.asset_seq] = r
        elif profile_asset.major == asset_version.major \
                and profile_asset.minor == asset_version.minor \
                and profile_asset.patch == asset_version.patch:
            reduced[asset_version.asset_seq] = r
    return reduced.values()


def validate_category(category: str) -> None:
    if len(category) > MAX_CATEGORY_LEN:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            f"category must be {MAX_CATEGORY_LEN} characters or fewer."
        )

    if not URL_SAFE_REGEX.match(category):
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            "category contains invalid characters - only URL-safe characters (alphanumeric, '-', '_', '.') are allowed."
        )


def select_filtered_g_assets(session: Session, profile: SessionProfile, category: Optional[str]) -> list[
    AssetVersionResult]:
    stmt = select(Asset, AssetVersion, FileContent, ProfileAsset) \
        .select_from(Asset) \
        .outerjoin(
        AssetVersion,
        (Asset.asset_seq == AssetVersion.asset_seq)) \
        .outerjoin(
        FileContent,
        (AssetVersion.package_seq == FileContent.file_seq)) \
        .outerjoin(
        ProfileAsset,
        (Asset.asset_seq == ProfileAsset.asset_seq)).where(
        (ProfileAsset.profile_seq == profile.profile_seq) \
        & (ProfileAsset.category == category) if category else \
            (ProfileAsset.profile_seq == profile.profile_seq))

    db_results = session.exec(stmt).all()
    avr_results = repo.process_join_results(session, filter_profile_assets(db_results))
    return avr_results


@router.get('/{category}')
async def for_profile(
        category: str,
        auth_profile=Depends(session_profile)) -> list[AssetVersionResult]:
    """
    Return all assets that have been listed by this profile
    """
    with get_session(echo=False) as session:
        return select_filtered_g_assets(session, auth_profile, category=category)


@router.post('/{category}/{asset_id}/versions/{version}', status_code=HTTPStatus.CREATED)
async def add(
        category: str,
        asset_id: str,
        version: str,
        profile: SessionProfile = Depends(session_profile)) -> AssetVersionResult:
    """
    Return all assets that have been attached to this profile
    """
    asset_seq = asset_id_to_seq(asset_id)
    version_id = convert_version_input(version)

    validate_category(category)

    major, minor, patch = version_id
    with get_session() as session:
        session.exec(insert(
            ProfileAsset).values(
            profile_seq=profile.profile_seq,
            asset_seq=asset_seq,
            major=major,
            minor=minor,
            patch=patch,
            category=category))
        session.commit()

        # read back
        avr_results = repo.select_asset_version(session, asset_id, tuple(version_id))
        avr = repo.process_join_results(session, avr_results)
        return avr[0]


@router.delete('/{category}/{asset_id}/versions/{version}')
async def g_delete(
        category: str,
        asset_id: str,
        version: str,
        profile: SessionProfile = Depends(session_profile)):
    """
    Delete a profile asset group item
    """
    version_id = convert_version_input(version)
    major, minor, patch = version_id
    validate_category(category)
    asset_seq = asset_id_to_seq(asset_id)
    with get_session() as session:
        stmt = delete(ProfileAsset) \
            .where(ProfileAsset.profile_seq == profile.profile_seq) \
            .where(ProfileAsset.asset_seq == asset_seq) \
            .where(ProfileAsset.major == major) \
            .where(ProfileAsset.minor == minor) \
            .where(ProfileAsset.patch == patch) \
            .where(ProfileAsset.category == category)
        r = session.exec(stmt)
        session.commit()
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"delete failed for {category}/{asset_id}/{version}")
