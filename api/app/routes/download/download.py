import logging
from http import HTTPStatus
from uuid import UUID

from fastapi import Depends, HTTPException, Response, APIRouter
from pydantic import BaseModel
from sqlmodel import select

from db.connection import get_session
from db.schema.media import FileContent
from routes.storage_client import storage_client
from storage.storage_client import StorageClient

log = logging.getLogger(__name__)

router = APIRouter(prefix="/download", tags=["files"])


class DownloadInfoResponse(BaseModel):
    file_id: UUID
    name: str
    size: int
    content_type: str
    content_hash: str
    url: str


def translate_minio(storage, info, content_hash) -> str:
    bucket, object_name = info.split(":")
    return storage.download_link(bucket, object_name)


def translate_gcs(storage, info, content_hash) -> str:
    return f"https://implementme.notadomain/{content_hash}"


storage_types = {
    'minio': translate_minio,
    'gcs': translate_gcs,
}


def translate_download_url(storage, locators: list[str], content_hash: str) -> str:
    for locator in locators:
        log.info("translating %s", locator)
        locator_type, info = locator.split("://")
        translate_func = storage_types.get(locator_type)
        if translate_func is None:
            log.error("unsupported storage type %s", locator_type)
        url = translate_func(storage, info, content_hash)
        if url is not None:
            return url
    raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, detail="no valid locators for file")


@router.get('/info/{file_id}')
async def download_file(
        file_id: str,
        storage: StorageClient = Depends(storage_client)) -> DownloadInfoResponse:
    """Return information needed to download the file including the temporary URL"""
    with get_session() as session:
        file = session.exec(select(FileContent).where(FileContent.id == file_id)).first()
        if file is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="file_id not found")
        locator_list = file.locators['locators']
        return DownloadInfoResponse(
            file_id=file.id,
            url=translate_download_url(storage, locator_list, file.content_hash),
            **file.model_dump())


@router.get('/{file_id}')
async def download_file(
        file_id: str,
        response: Response,
        storage: StorageClient = Depends(storage_client)):
    """Redirects to a temporary download link from a valid file_id"""
    with get_session() as session:
        file = session.exec(select(FileContent).where(FileContent.id == file_id)).first()
        if file is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="file_id not found")
        locator_list = file.locators['locators']
        response.status_code = HTTPStatus.TEMPORARY_REDIRECT
        response.headers['location'] = translate_download_url(storage, locator_list, file.content_hash)
