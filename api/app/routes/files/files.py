from http import HTTPStatus
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, delete

from db.connection import get_session
from db.schema.media import FileContent
from db.schema.profiles import Profile
from routes.authorization import current_profile
from routes.file_events import enrich_file
from routes.responses import FileUploadResponse

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/{file_id}")
async def get_file_by_id(
        file_id: UUID,
        profile: Profile = Depends(current_profile)) -> FileUploadResponse:
    """Query a file by ID, returns owner event data"""
    with get_session() as session:
        file = session.exec(
            select(FileContent).where(
                FileContent.id == file_id)).first()
        return enrich_file(session, file, profile)


@router.get("/by_content/{content_hash}")
async def get_file_by_content(
        content_hash: str,
        profile: Profile = Depends(current_profile)) -> FileUploadResponse:
    """Query a file by its content hash"""
    with get_session() as session:
        file = session.exec(
            select(FileContent).where(
                FileContent.content_hash == content_hash)).first()
        return enrich_file(session, file, profile)


@router.delete('/{file_id}')
async def delete_file_by_id(file_id, profile: Profile = Depends(current_profile)):
    """Delete a file by its ID"""
    with get_session(echo=True) as session:
        result = session.exec(
            delete(FileContent).where(
                FileContent.id == file_id).where(
                FileContent.owner == profile.id))
        if result.rowcount != 1:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                detail="file not found, or not owned")
        session.commit()
