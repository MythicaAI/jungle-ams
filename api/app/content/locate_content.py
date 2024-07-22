from sqlmodel import select, Session

from db.schema.media import FileContent


def locate_content_by_hash(session: Session, content_hash: str) -> [FileContent]:
    """Lookup content using the session by its content hash"""
    stmt = select(FileContent).where(FileContent.content_hash == content_hash)
    return session.exec(stmt).all()


def locate_content_by_seq(session: Session, file_seq: int) -> FileContent:
    """Find file content by its file sequence"""
    stmt = select(FileContent).where(
        FileContent.file_seq == file_seq).where(
        FileContent.deleted is not None)
    result = session.exec(stmt)
    file_content = result.one_or_none()
    if file_content is None:
        raise FileNotFoundError
    return file_content
