"""Implementation of assets/ HTTP routes"""

import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlmodel.ext.asyncio.session import AsyncSession

import assets.repo as repo
from db.connection import get_session
from ripple.models.sessions import SessionProfile
from routes.authorization import session_profile
from routes.storage_client import storage_client
from storage.storage_client import StorageClient

log = logging.getLogger(__name__)

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get('/log', include_in_schema=False)
async def log_request_headers(r: Request):
    """Log request headers for debugging"""
    header_str = str(r.headers)
    print(f"{header_str}")
    return "LOGGED"


@router.get('/all')
async def list_all(db_session: AsyncSession = Depends(get_session)) -> list[repo.AssetVersionResult]:
    """Get all asset versions"""
    join_results = await (db_session.exec(
        repo.asset_join_select)).all()
    return await repo.process_join_results(db_session, join_results)


@router.get('/top')
async def list_top(db_session: AsyncSession = Depends(get_session)) -> list[repo.AssetTopResult]:
    """Get the list of asset headers top of the current profile"""
    return await repo.top(db_session)


@router.get('/owned')
async def list_owned(
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_session)) -> list[repo.AssetVersionResult]:
    """Get the list of asset headers owned by the current profile"""
    return repo.owned_versions(db_session, profile.profile_seq)


@router.get('/named/{asset_name}')
async def named(asset_name) -> list[repo.AssetVersionResult]:
    """Get asset by name"""
    with get_session() as session:
        return repo.versions_by_name(session, asset_name)


@router.get('/committed_at')
async def committed_at(ref: str) -> list[repo.AssetVersionResult]:
    """Find any asset versions with commit_ref containing ref"""
    with get_session() as session:
        return repo.versions_by_commit_ref(session, ref)


@router.get('/{asset_id}')
async def by_id(asset_id: str) -> list[repo.AssetVersionResult]:
    """Get asset by id"""
    with get_session() as session:
        return repo.version_by_asset_id(session, asset_id)


@router.post('/', status_code=HTTPStatus.CREATED)
async def create(r: repo.AssetCreateRequest,
                 profile: SessionProfile = Depends(session_profile)) \
        -> repo.AssetCreateResult:
    """Create a new asset for storing revisions or other assets"""
    with get_session() as session:
        return repo.create_root(session, r, profile.profile_seq)


@router.post('/{asset_id}/versions/{version_str}')
async def create_version(asset_id: str,
                         version_str: str,
                         req: repo.AssetCreateVersionRequest,
                         response: Response,
                         profile: SessionProfile = Depends(session_profile)) \
        -> repo.AssetVersionResult:
    """Create or update a single asset version"""
    with get_session() as session:
        create_or_update, version_result = repo.create_version(session,
                                                               asset_id,
                                                               version_str,
                                                               req,
                                                               profile,
                                                               profile.profile_seq,
                                                               profile.profile_seq)
        if create_or_update == repo.CreateOrUpdate.CREATE:
            response.status_code = HTTPStatus.CREATED
        return version_result


@router.get('/{asset_id}/versions/{version_str}/dependencies')
async def dependencies(
        asset_id: str,
        version_str: str,
        storage: StorageClient = Depends(storage_client)) -> repo.AssetDependencyResult:
    with get_session() as session:
        return repo.select_asset_dependencies(session, asset_id, version_str, storage)


@router.delete('/{asset_id}/versions/{version_str}')
async def delete_version(
        asset_id: str,
        version_str: str,
        profile: SessionProfile = Depends(session_profile)):
    """Delete a specific asset version"""
    with get_session(echo=False) as session:
        repo.delete_version(session, asset_id, version_str, profile.profile_seq)


@router.delete('/{asset_id}')
async def delete_asset(
        asset_id: str,
        profile: SessionProfile = Depends(session_profile)):
    """Delete an asset and it's asset-versions"""
    with get_session(echo=False) as session:
        repo.delete_asset_and_versions(session, asset_id, profile)


@router.get('/{asset_id}/versions/{version_str}')
async def by_version(
        asset_id: str,
        version_str: str) -> repo.AssetVersionResult:
    """Get the asset version for a given asset and version"""
    version_id = repo.convert_version_input(version_str)
    with get_session() as session:
        avr_results = repo.select_asset_version(session, asset_id, version_id)
        version = repo.process_join_results(session, avr_results)[0] if avr_results else None
        if version is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{asset_id}', version {version_id} not found")
        return version
