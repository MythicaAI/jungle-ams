from uuid import UUID

from db.schema.media import FileContent
from sqlmodel import select, Session


def locate_content_by_hash(session: Session, content_hash: str) -> [FileContent]:
    """Lookup content using the session by its content hash"""
    stmt = select(FileContent).where(FileContent.content_hash == content_hash)
    return session.exec(stmt).all()


def locate_content_by_id(session: Session, file_id: UUID) -> FileContent:
    """Find file content by its globally unique ID"""
    stmt = select(FileContent).where(
        FileContent.id == file_id).where(
            FileContent.deleted is not None)
    result = session.exec(stmt)
    file_content = result.one_or_none()
    if file_content is None:
        raise FileNotFoundError
    return file_content
