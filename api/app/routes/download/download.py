"""Routes and helpers providing /download API"""
import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlmodel import Session, select, update

from cryptid.cryptid import file_id_to_seq, file_seq_to_id, profile_seq_to_id
from db.connection import get_session
from db.schema.media import FileContent
from routes.storage_client import storage_client
from storage.local_file_uploader import LocalFileStorageClient
from storage.storage_client import StorageClient

log = logging.getLogger(__name__)

router = APIRouter(prefix="/download", tags=["files"])


class DownloadInfoResponse(BaseModel):
    file_id: str
    owner_id: str
    name: str
    size: int
    content_type: str
    content_hash: str
    url: str


def translate_minio(storage, object_spec) -> str:
    """minio download link creator"""
    bucket, object_name = object_spec.split(":")
    return storage.download_link(bucket, object_name)


def translate_gcs(storage, object_spec) -> str:
    """GCS download link creator"""
    region_bucket, object_name = object_spec.split(":")
    _, bucket_name = region_bucket.split('.')
    return storage.download_link(bucket_name, object_name)


def translate_test(storage: LocalFileStorageClient, object_spec: str) -> str:
    """LocalStorage download link creator"""
    return storage.download_link(*object_spec.split(":"))


def increment_download_count(session: Session, file_seq: int):
    """Increment the download count by one"""
    session.exec(update(FileContent)
                 .values(downloads=FileContent.downloads + 1)
                 .where(FileContent.file_seq == file_seq))
    session.commit()


storage_types = {
    'gcs': translate_gcs,
    'minio': translate_minio,
    'test': translate_test,
}


def translate_download_url(storage, locators: list[str]) -> str:
    """translate locators to a downloadable URL"""
    for locator in locators:
        log.info("translating %s", locator)
        locator_type, object_spec = locator.split("://")
        translate_func = storage_types.get(locator_type)
        if translate_func is None:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "unsupported storage type %s", locator_type)

        url = translate_func(storage, object_spec)
        if url is not None:
            return url
    raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, detail="no valid locators for file")


@router.get('/info/{file_id}')
async def info(
        file_id: str,
        storage: StorageClient = Depends(storage_client)) -> DownloadInfoResponse:
    """Return information needed to download the file including the temporary URL"""
    with get_session(echo=True) as session:
        file_seq = file_id_to_seq(file_id)
        increment_download_count(session, file_seq)
        file = session.exec(select(FileContent).where(FileContent.file_seq == file_seq)).one_or_none()
        if file is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="file_id not found")
        locator_list = file.locators['locators']
        return DownloadInfoResponse(
            **file.model_dump(),
            file_id=file_seq_to_id(file.file_seq),
            owner_id=profile_seq_to_id(file.owner_seq),
            url=translate_download_url(storage, locator_list))


@router.get('/{file_id}')
async def redirect(
        file_id: str,
        response: Response,
        storage: StorageClient = Depends(storage_client)):
    """Redirects to a temporary download link from a valid file_id"""
    with get_session() as session:
        file_seq = file_id_to_seq(file_id)
        increment_download_count(session, file_seq)
        file = session.exec(select(FileContent).where(FileContent.file_seq == file_seq)).first()
        if file is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="file_id not found")
        locator_list = file.locators['locators']
        response.status_code = HTTPStatus.TEMPORARY_REDIRECT
        response.headers['location'] = translate_download_url(storage, locator_list)
