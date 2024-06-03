from http import HTTPStatus

import sqlalchemy
from flask import Blueprint, request, jsonify, g, current_app as app
from psycopg2 import IntegrityError
from sqlmodel import select, update, insert

from auth.data import get_profile
from content.locate_content import locate_content
from db.schema.assets import *
from db.connection import get_session

from pydantic import BaseModel, ValidationError

ZERO_ID = UUID(int=0, version=4)

assets_bp = Blueprint('assets', __name__)


class CreateAssetModel(BaseModel):
    id: UUID | None = None
    major: int = 0
    minor: int = 1
    patch: int = 0
    content_hash: str | None
    friendly_name: str
    tags: Dict[str, Any] | None = None


def process_join_results(join_results):
    results_by_asset = dict()
    for join_result in join_results:
        asset, ver = join_result
        asset_unique_id = f"{asset.id}:{asset.collection_id}"
        r = dict(
            version=[ver.major, ver.minor, ver.patch],
            owner=asset.owner,
            created=ver.created,
            content_hash=ver.content_hash,
            friendly_name=ver.friendly_name,
            tags=ver.tags)
        results_by_asset.setdefault(asset_unique_id, list()).append(r)
    return results_by_asset


@assets_bp.route('all', methods=['GET'])
def get_assets():
    with get_session() as session:
        join_results = session.exec(select(Asset, AssetVersion).where(Asset.id == AssetVersion.asset_id)).all()
        processed_results = process_join_results(join_results)
        return jsonify({'message': 'ok', 'results': processed_results})



@assets_bp.route('latest', methods=['GET'])
def get_assets_by_latest_ts():
    with get_session() as session:
        results = session.exec(select(Asset).order_by(Asset.updated))
        return jsonify({'message': 'ok', 'results': [r.model_dump() for r in results]})


@assets_bp.route('named/<asset_name>', methods=['GET'])
def get_asset_by_name(asset_name):
    with get_session() as session:
        results = session.exec(select(Asset).where('updated'))
        return jsonify({'message': 'ok', 'results': [r.model_dump() for r in results]})


@assets_bp.route('<asset_id>', methods=['GET'])
def get_asset_by_id(asset_id):
    with get_session() as session:
        db_results = session.exec(select(Asset, AssetVersion).where(Asset.id == asset_id).where(Asset.id == AssetVersion.asset_id))
        results = process_join_results(db_results)
        return jsonify({'message': 'ok', 'results': results})


@assets_bp.route('create', methods=['POST'])
def create_asset():
    profile = get_profile(request.headers.get('Authorization'))
    try:
        obj = dict(**request.json)
        r = CreateAssetModel.model_validate(obj=obj)
    except TypeError as e:
        return jsonify({'error': str(e)}), HTTPStatus.BAD_REQUEST
    except ValidationError as e:
        return e.json(), HTTPStatus.BAD_REQUEST

    try:
        file_content = locate_content(r.content_hash)
    except FileNotFoundError:
        return jsonify({'error': f"content hash '{r.content_hash}' not found"}), HTTPStatus.NOT_FOUND

    with get_session() as session:
        if r.id is None or r.id == ZERO_ID:
            asset_result = session.exec(insert(Asset).values(owner=profile.id))
            asset_id = asset_result.inserted_primary_key[0]
        else:
            asset_id = r.id
        try:
            asset_version_result = session.exec(insert(AssetVersion).values(
                asset_id=asset_id,
                major=r.major,
                minor=r.minor,
                patch=r.patch,
                content_hash=r.content_hash,
                friendly_name=r.friendly_name,
                tags=r.tags,
                author=profile.id))
        except sqlalchemy.exc.IntegrityError as _:
            return jsonify({
                'error': f'asset version {[r.major, r.minor, r.patch]} exists',
                'asset_id': asset_id,
                'version': [r.major, r.minor, r.patch]}), HTTPStatus.CONFLICT

        asset_version_id = asset_version_result.inserted_primary_key[0]
        session.commit()
    return jsonify({'message': 'ok',
                    'result': {
                        'asset_id': asset_id,
                        'asset_version_id': asset_version_id
                    }})


@assets_bp.route('update', methods=['POST'])
def update_asset():
    pass
