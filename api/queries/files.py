from http import HTTPStatus
from sqlite3 import IntegrityError
from gcid.gcid import file_id_to_seq
from fastapi import HTTPException
from sqlalchemy import and_, update
from sqlmodel.ext.asyncio.session import AsyncSession
from meshwork.models.sessions import SessionProfile
from db.schema.media import FileContent
from sqlalchemy.sql.functions import now as sql_now


async def delete_by_id(file_id: str, profile: SessionProfile, db_session: AsyncSession):
    """Delete a file by its ID"""
    try:
        file_seq = file_id_to_seq(file_id)
        result = await db_session.exec(
            (update(FileContent)
             .values(deleted=sql_now(), )
             .where(and_(FileContent.file_seq == file_seq,
                         FileContent.owner_seq == profile.profile_seq))))
        if result.rowcount != 1:
            raise HTTPException(HTTPStatus.NOT_FOUND,
                                detail="file not found, or not owned")
        await db_session.commit()
    except IntegrityError as e:
        raise HTTPException(HTTPStatus.FORBIDDEN, f"file {file_id} is still referenced") from e
