from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from db.schema.media import FileContent


async def locate_content_by_hash(db_session: AsyncSession, content_hash: str) -> [FileContent]:
    """Lookup content using the session by its content hash"""
    stmt = select(FileContent).where(FileContent.content_hash == content_hash)
    return (await db_session.exec(stmt)).all()


async def locate_content_by_seq(db_session: AsyncSession, file_seq: int) -> FileContent:
    """Find file content by its file sequence"""
    stmt = select(FileContent).where(
        FileContent.file_seq == file_seq).where(
        FileContent.deleted is not None)
    result = await db_session.exec(stmt)
    return result.one_or_none()
