"""Implementation of assets/ HTTP routes"""

import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response

import assets.repo as repo
from db.connection import get_session
from db.schema.profiles import Profile
from routes.authorization import session_profile

log = logging.getLogger(__name__)

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get('/log', include_in_schema=False)
async def log_request_headers(r: Request):
    """Log request headers for debugging"""
    header_str = str(r.headers)
    print(f"{header_str}")
    return "LOGGED"


@router.get('/all')
async def list_all(
    limit: int = Query(10, le=100),
    offset: int = 0,
) -> list[repo.AssetVersionResult]:
    """Get all asset versions"""
    with get_session() as session:
        join_results = session.exec(
            repo.asset_join_select
            .limit(limit)
            .offset(offset)
        ).all()
        return repo.process_join_results(session, join_results)


@router.get('/top')
async def list_top(
    limit: int = Query(10, le=100),
    offset: int = 0,
) -> list[repo.AssetTopResult]:
    """Get the list of asset headers top of the current profile"""
    with get_session(echo=True) as session:
        return repo.top(session, limit, offset)


@router.get('/owned')
async def list_owned(
    profile: Profile = Depends(session_profile),
    limit: int = Query(10, le=100),
    offset: int = 0,
) -> list[repo.AssetVersionResult]:
    """Get the list of asset headers owned by the current profile"""
    with get_session() as session:
        return repo.owned_versions(session, profile.profile_seq, limit, offset)


@router.get('/named/{asset_name}')
async def named(
    asset_name: str,
    limit: int = Query(10, le=100),
    offset: int = 0,
) -> list[repo.AssetVersionResult]:
    """Get asset by name"""
    with get_session() as session:
        return repo.versions_by_name(session, asset_name, limit, offset)


@router.get('/committed_at')
async def committed_at(
    ref: str,
    limit: int = Query(10, le=100),
    offset: int = 0,
) -> list[repo.AssetVersionResult]:
    """Find any asset versions with commit_ref containing ref"""
    with get_session() as session:
        return repo.versions_by_commit_ref(session, ref, limit, offset)


@router.get('/{asset_id}')
async def by_id(asset_id: str) -> list[repo.AssetVersionResult]:
    """Get asset by id"""
    with get_session() as session:
        return repo.version_by_asset_id(session, asset_id)


@router.post('/', status_code=HTTPStatus.CREATED)
async def create(r: repo.AssetCreateRequest,
                 profile: Profile = Depends(session_profile)
                 ) -> repo.AssetCreateResult:
    """Create a new asset for storing revisions or other assets"""
    with get_session() as session:
        return repo.create_root(session, r, profile.profile_seq)


@router.post('/{asset_id}/versions/{version_str}')
async def create_version(asset_id: str,
                         version_str: str,
                         req: repo.AssetCreateVersionRequest,
                         response: Response,
                         profile: Profile = Depends(session_profile)) \
        -> repo.AssetVersionResult:
    """Create or update a single asset version"""
    with get_session() as session:
        create_or_update, version_result = repo.create_version(session,
                                                               asset_id,
                                                               version_str,
                                                               req,
                                                               profile.profile_seq)
        if create_or_update == repo.CreateOrUpdate.CREATE:
            response.status_code = HTTPStatus.CREATED
        return version_result


@router.delete('/{asset_id}/versions/{version_str}')
async def delete_version(
        asset_id: str,
        version_str: str,
        profile: Profile = Depends(session_profile)):
    """Delete a specific asset version"""
    with get_session(echo=True) as session:
        repo.delete_version(session, asset_id, version_str, profile.profile_seq)


@router.get('/{asset_id}/versions/{version_str}')
async def by_version(
        asset_id: str,
        version_str: str) -> repo.AssetVersionResult:
    """Get the asset version for a given asset and version"""
    version_id = repo.convert_version_input(version_str)
    with get_session() as session:
        version = repo.select_asset_version(session, asset_id, version_id)
        if version is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{asset_id}', version {version_id} not found")
        return version
