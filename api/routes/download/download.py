"""Routes and helpers providing /download API"""
import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from content.resolve_download_info import DownloadInfoResponse, increment_download_count, resolve_download_info, \
    translate_download_url
from gcid.gcid import file_id_to_seq
from db.connection import get_db_session
from db.schema.media import FileContent
from routes.storage_client import storage_client
from storage.storage_client import StorageClient

log = logging.getLogger(__name__)

router = APIRouter(prefix="/download", tags=["files"])


@router.get("/info/{file_id}")
async def info(
        file_id: str,
        storage: StorageClient = Depends(storage_client),
        db_session: AsyncSession = Depends(get_db_session)) -> DownloadInfoResponse:
    """Return information needed to download the file including the temporary URL"""
    response = await resolve_download_info(db_session, file_id, storage)
    if response is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"{file_id} not found")
    return response


@router.get("/{file_id}")
async def redirect(
        file_id: str,
        response: Response,
        storage: StorageClient = Depends(storage_client),
        db_session: AsyncSession = Depends(get_db_session)):
    """Redirects to a temporary download link from a valid file_id"""
    file_seq = file_id_to_seq(file_id)
    await increment_download_count(db_session, file_seq)
    file_result = await db_session.exec(select(FileContent).where(FileContent.file_seq == file_seq))
    file = file_result.first()
    if file is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="file_id not found")
    response.status_code = HTTPStatus.TEMPORARY_REDIRECT
    response.headers["location"] = translate_download_url(storage, file)
