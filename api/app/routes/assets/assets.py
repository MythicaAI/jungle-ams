from datetime import datetime
from http import HTTPStatus
from typing import Dict, Any, List
from uuid import UUID

import sqlalchemy
from flask import Blueprint, request, jsonify, g, current_app as app
from fastapi import APIRouter
from psycopg2 import IntegrityError
from sqlmodel import select, update, insert

from auth.data import get_profile
from content.locate_content import locate_content_by_id
from db.schema.assets import Asset, AssetVersion
from db.schema.media import FileContent
from db.connection import get_session

from pydantic import BaseModel, ValidationError

ZERO_ID = UUID(int=0, version=4)

router = APIRouter(prefix="/assets")


class CreateAssetModel(BaseModel):
    id: UUID | None = None
    major: int = 0
    minor: int = 1
    patch: int = 0
    file_id: UUID = None
    friendly_name: str
    tags: Dict[str, Any] | None = None


class AssetVersionResultModel(BaseModel):
    version: List[int] = None
    owner: UUID = None
    created: datetime = None
    content_hash: str = None
    file_id: UUID = None
    size: int = None
    friendly_name: str | None = None
    tags: Dict[str, Any] | None = None


class AssetHeadResultModel(BaseModel):
    id: UUID | None = None
    collection_id: UUID | None = None
    versions: List[AssetVersionResultModel] = list()

    def __hash__(self):
        return hash(self.id)


def process_join_results(join_results):
    """Process the join result of Asset, AssetVersion and FileContent tables"""
    results_by_asset = dict()
    for join_result in join_results:
        asset, ver, file = join_result
        asset_head = results_by_asset.setdefault(
            asset.id, AssetHeadResultModel(id=asset.id, collection_id=asset.collection_id))
        asset_version = AssetVersionResultModel(
            version=[ver.major, ver.minor, ver.patch],
            owner=asset.owner,
            author=ver.created,
            file_id=file.id,
            content_hash=file.content_hash,
            size=file.size,
            friendly_name=ver.friendly_name,
            tags=ver.tags)
        asset_head.versions.append(asset_version)
    return [r.model_dump() for r in results_by_asset.values()]


@router.get('/all')
async def get_assets():
    with get_session() as session:
        join_results = session.exec(
            select(Asset, AssetVersion, FileContent).where(
                Asset.id == AssetVersion.asset_id).where(
                AssetVersion.file_id == FileContent.id)).all()
        processed_results = process_join_results(join_results)
        return jsonify({'message': 'ok', 'results': processed_results})


@router.get('/latest')
async def get_assets_by_latest_ts():
    with get_session() as session:
        results = session.exec(select(Asset).order_by(Asset.updated))
        return jsonify({'message': 'ok', 'results': [r.model_dump() for r in results]})


@router.get('/named/{asset_name}')
async def get_asset_by_name(asset_name):
    with get_session() as session:
        results = session.exec(select(Asset).where('updated'))
        return jsonify({'message': 'ok', 'results': [r.model_dump() for r in results]})


@router.get('/{asset_id}')
async def get_asset_by_id(asset_id):
    with get_session() as session:
        db_results = session.exec(
            select(Asset, AssetVersion, FileContent).where(
                Asset.id == asset_id).where(
                Asset.id == AssetVersion.asset_id).where(
                AssetVersion.file_id == FileContent.id))
        results = process_join_results(db_results)
        return jsonify({'message': 'ok', 'results': results})


@router.post('/create')
async def create_asset():
    profile = get_profile(request.headers.get('Authorization'))
    try:
        obj = dict(**request.json)
        r = CreateAssetModel.model_validate(obj=obj)
    except TypeError as e:
        return jsonify({'error': str(e)}), HTTPStatus.BAD_REQUEST
    except ValidationError as e:
        return e.json(), HTTPStatus.BAD_REQUEST

    try:
        file = locate_content_by_id(r.file_id)
    except FileNotFoundError:
        return jsonify({'error': f"file '{r.file_id}' not found"}), HTTPStatus.NOT_FOUND

    version = [r.major, r.minor, r.patch]
    with get_session() as session:
        if r.id is None or r.id == ZERO_ID:
            asset_result = session.exec(insert(Asset).values(owner=profile.id))
            asset_id = asset_result.inserted_primary_key[0]
        else:
            asset_id = r.id
        try:
            session.exec(insert(AssetVersion).values(
                asset_id=asset_id,
                major=r.major,
                minor=r.minor,
                patch=r.patch,
                file_id=r.file_id,
                friendly_name=r.friendly_name,
                tags=r.tags,
                author=profile.id))
        except sqlalchemy.exc.IntegrityError as _:
            return jsonify({
                'error': f'asset version {[r.major, r.minor, r.patch]} exists',
                'asset_id': asset_id,
                'version': version}), HTTPStatus.CONFLICT
        session.commit()
    return jsonify({'message': 'ok',
                    'result': {
                        'asset_id': asset_id,
                        'file_id': file.id,
                        'content_hash': file.content_hash,
                        'size': file.size,
                        'author': profile.id,
                        'version': version
                    }})


@router.post('/update')
async def update_asset():
    pass
