from uuid import UUID

from db.schema.media import FileContent
from db.connection import get_session
from sqlmodel import select


def locate_content_by_hash(content_hash: str) -> FileContent:
    with get_session() as session:
        stmt = session.query(FileContent).filter(FileContent.content_hash == content_hash)
        result = session.exec(stmt)
        file_content = result.one_or_none()
        if file_content is None:
            raise FileNotFoundError
        return file_content


def locate_content_by_id(file_id: UUID) -> FileContent:
    with get_session() as session:
        stmt = select(FileContent).where(
            FileContent.id == file_id).where(
                FileContent.deleted is not None)
        result = session.exec(stmt)
        file_content = result.one_or_none()
        if file_content is None:
            raise FileNotFoundError
        return file_content
