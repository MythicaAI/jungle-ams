from uuid import UUID

from fastapi import APIRouter

from db.connection import get_session
from db.schema.media import FileContent
from sqlmodel import select

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/{file_id}")
async def get_file_by_id(file_id: UUID) -> FileContent:
    with get_session() as session:
        return session.exec(
            select(FileContent).where(
                FileContent.id == file_id)).first()


@router.get("/by_content/{content_hash}")
async def get_file_by_content(content_hash: str) -> FileContent:
    with get_session() as session:
        return session.exec(
            select(FileContent).where(
                FileContent.content_hash == content_hash)).first()


@router.get("/by_owner/{owner_id}")
async def get_file_by_owner(owner_id: UUID) -> list[FileContent]:
    with get_session() as session:
        return session.exec(
            select(FileContent).where(
                FileContent.owner == owner_id)).all()
