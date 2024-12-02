import logging
from http import HTTPStatus
from typing import Optional

from fastapi import HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select, update

from auth.authorization import Scope, validate_roles
import auth.roles
from cryptid.cryptid import file_id_to_seq, file_seq_to_id, profile_seq_to_id
from auth.generate_token import SessionProfile
from db.schema.media import FileContent
from storage.local_file_uploader import LocalFileStorageClient
from storage.storage_client import StorageClient

log = logging.getLogger(__name__)


class DownloadInfoResponse(BaseModel):
    """Resolved file metadata and download URL for"""
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


storage_types = {
    'gcs': translate_gcs,
    'minio': translate_minio,
    'test': translate_test,
}


def increment_download_count(session: Session, file_seq: int):
    """Increment the download count by one"""
    session.exec(update(FileContent)
                 .values(downloads=FileContent.downloads + 1)
                 .where(FileContent.file_seq == file_seq))
    session.commit()


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


def resolve_download_info(
        session: Session,
        file_id,
        storage: StorageClient,
        profile: SessionProfile) -> Optional[DownloadInfoResponse]:
    """Given a file_id and storage client resolve the download info"""
    file_seq = file_id_to_seq(file_id)
    file = session.exec(select(FileContent).where(FileContent.file_seq == file_seq)).one_or_none()
    if file is None:
        return None
    validate_roles(role=auth.roles.file_get,
        object_id=file.visibility, auth_roles=profile.auth_roles,
        scope=Scope(profile=profile, file=file))
    increment_download_count(session, file_seq)
    locator_list = file.locators['locators']
    return DownloadInfoResponse(
        **file.model_dump(),
        file_id=file_seq_to_id(file.file_seq),
        owner_id=profile_seq_to_id(file.owner_seq),
        url=translate_download_url(storage, locator_list))
