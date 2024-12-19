from http import HTTPStatus
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import and_, select, update

from cryptid.cryptid import file_id_to_seq, profile_id_to_seq
from db.connection import get_session
from db.schema.media import FileContent
from db.schema.profiles import Profile
from ripple.models.contexts import FilePurpose
from routes.authorization import session_profile, session_profile_id
from routes.file_uploads import FileUploadResponse, enrich_file, enrich_files
router = APIRouter(prefix="/files", tags=["files"])


@router.get("/{file_id}")
async def by_id(
        file_id: str,
        profile: Profile = Depends(session_profile)) -> FileUploadResponse:
    """Query a file by ID, returns owner event data"""
    file_seq = file_id_to_seq(file_id)
    with get_session() as session:
        file = session.exec(
            select(FileContent).where(
                and_(
                    FileContent.file_seq == file_seq,
                    FileContent.deleted == None))).first()
        if file:
            return enrich_file(session, file, profile)
        else:
            raise HTTPException(status_code=404, detail="File not found")


@router.get("/by_content/{content_hash}")
async def by_content(
        content_hash: str,
        impersonate_profile_id: Optional[str] = Header(None, include_in_schema=False),
        profile: Profile = Depends(session_profile)) -> FileUploadResponse:
    """Query a file by its content hash"""
    if impersonate_profile_id:
        owner_seq = profile_id_to_seq(impersonate_profile_id)
    else:
        owner_seq = profile.profile_seq

    with get_session() as session:
        file = session.exec((
            select(FileContent)
            .where(FileContent.owner_seq == owner_seq)
            .where(FileContent.content_hash == content_hash)
            .where(FileContent.deleted == None))).first()
        if file is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail=f"SHA1 {content_hash} not found")
        return enrich_file(session, file, profile)


@router.get("/by_purpose/{file_purpose}")
async def by_purpose(
        file_purpose: FilePurpose,
        profile: Profile = Depends(session_profile)) -> list[FileUploadResponse]:
    """Query a file by its content hash"""
    with get_session() as session:
        files = session.exec((
            select(FileContent)
            .where(FileContent.owner_seq == profile.profile_seq)
            .where(FileContent.purpose == file_purpose)
            .where(FileContent.deleted == None))).all()
        return enrich_files(session, files, profile)


@router.delete('/{file_id}')
async def delete_by_id(file_id, profile_id: str = Depends(session_profile_id)):
    """Delete a file by its ID"""
    profile_seq = profile_id_to_seq(profile_id)
    with get_session(echo=True) as session:
        try:
            file_seq = file_id_to_seq(file_id)
            result = session.exec(
                (update(FileContent)
                 .values(deleted=sql_now(), )
                 .where(and_(FileContent.file_seq == file_seq,
                             FileContent.owner_seq == profile_seq))))
            if result.rowcount != 1:
                raise HTTPException(HTTPStatus.NOT_FOUND,
                                    detail="file not found, or not owned")
            session.commit()
        except IntegrityError as e:
            raise HTTPException(HTTPStatus.FORBIDDEN, f"file {file_id} is still referenced") from e

