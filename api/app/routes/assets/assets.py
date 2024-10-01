import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from assets.assets_repo import AssetCreateRequest, AssetCreateResult, AssetCreateVersionRequest, AssetTopResult, \
    AssetVersionResult, CreateOrUpdate, asset_join_select, convert_version_input, create, create_version, \
    delete_version, owned_versions, process_join_results, select_asset_version, top, version_by_asset_id, \
    versions_by_commit_ref, versions_by_name
from db.connection import get_session
from db.schema.assets import Asset, AssetVersion
from db.schema.profiles import Profile
from routes.authorization import current_profile

log = logging.getLogger(__name__)

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get('/log')
async def log_request(r: Request):
    header_str = str(r.headers)
    print(f"{header_str}")
    return "LOGGED"


@router.get('/all')
async def get_assets() -> list[AssetVersionResult]:
    """Get all asset versions"""
    with get_session() as session:
        join_results = session.exec(
            asset_join_select.where(
                Asset.asset_seq == AssetVersion.asset_seq)).all()
        return process_join_results(session, join_results)


@router.get('/top')
async def get_top_assets() -> list[AssetTopResult]:
    """Get the list of asset headers top of the current profile"""
    with get_session(echo=True) as session:
        return top(session)


@router.get('/owned')
async def get_owned_assets(
        profile: Profile = Depends(current_profile)) -> list[AssetVersionResult]:
    """Get the list of asset headers owned by the current profile"""
    with get_session() as session:
        return owned_versions(session, profile.profile_seq)


@router.get('/named/{asset_name}')
async def get_asset_by_name(asset_name) -> list[AssetVersionResult]:
    """Get asset by name"""
    with get_session() as session:
        return versions_by_name(session, asset_name)


@router.get('/committed_at')
async def get_assets_by_ref(ref: str) -> list[AssetVersionResult]:
    """Find any asset versions with commit_ref containing ref"""
    with get_session() as session:
        return versions_by_commit_ref(session, ref)


@router.get('/{asset_id}')
async def get_asset_by_id(asset_id: str) -> list[AssetVersionResult]:
    """Get asset by id"""
    with get_session() as session:
        return version_by_asset_id(session, asset_id)


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_asset(r: AssetCreateRequest,
                       profile: Profile = Depends(current_profile)
                       ) -> AssetCreateResult:
    """Create a new asset for storing revisions or other assets"""
    with get_session() as session:
        return create(session, r, profile.profile_seq)


@router.post('/{asset_id}/versions/{version_str}')
async def create_asset_version(asset_id: str,
                               version_str: str,
                               req: AssetCreateVersionRequest,
                               response: Response,
                               profile: Profile = Depends(current_profile)) \
        -> AssetVersionResult:
    """Create or update a single asset version"""
    with get_session() as session:
        create_or_update, version_result = create_version(session,
                                                          asset_id,
                                                          version_str,
                                                          req,
                                                          profile.profile_seq)
        if create_or_update == CreateOrUpdate.CREATE:
            response.status_code = HTTPStatus.CREATED
        return version_result


@router.delete('/{asset_id}/versions/{version_str}')
async def delete_asset_version(asset_id: str, version_str: str, profile: Profile = Depends(current_profile)):
    """Delete a specific asset version"""
    with get_session(echo=True) as session:
        delete_version(session, asset_id, version_str, profile.profile_seq)


@router.get('/{asset_id}/versions/{version_str}')
async def get_asset_version_by_id(
        asset_id: str,
        version_str: str) -> AssetVersionResult:
    """Get the asset version for a given asset and version"""
    version_id = convert_version_input(version_str)
    with get_session() as session:
        version = select_asset_version(session, asset_id, version_id)
        if version is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"asset '{asset_id}', version {version_id} not found")
        return version
