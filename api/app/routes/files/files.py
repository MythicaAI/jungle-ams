from uuid import UUID

from fastapi import APIRouter, Depends

from db.connection import get_session
from db.schema.media import FileContent
from sqlmodel import select

from db.schema.profiles import Profile
from routes.authorization import current_profile
from routes.responses import FileUploadResponse
from routes.file_events import enrich_file

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
