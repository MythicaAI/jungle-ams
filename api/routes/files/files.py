from gcid.gcid import file_id_to_seq
from db.connection import get_db_session
from db.schema.media import FileContent
from db.schema.profiles import Profile
from fastapi import APIRouter, Depends, HTTPException
from meshwork.models.contexts import FilePurpose
from meshwork.models.sessions import SessionProfile
from routes.authorization import session_profile
from routes.file_uploads import FileUploadResponse, enrich_file, enrich_files
from sqlmodel import and_, select
from sqlmodel.ext.asyncio.session import AsyncSession
from queries.files import delete_by_id

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/{file_id}")
async def by_id(
        file_id: str,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> FileUploadResponse:
    """Query a file by ID, returns owner event data"""
    file_seq = file_id_to_seq(file_id)
    file_result = await db_session.exec(
        select(FileContent).where(
            and_(
                FileContent.file_seq == file_seq,
                FileContent.deleted == None)))
    file = file_result.first()
    if file:
        return await enrich_file(db_session, file, profile)
    else:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/by_content/{content_hash}")
async def by_content(
        content_hash: str,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> FileUploadResponse:
    """Query a file by its content hash"""
    file_result = await db_session.exec((
        select(FileContent)
        .where(FileContent.owner_seq == profile.profile_seq)
        .where(FileContent.content_hash == content_hash)
        .where(FileContent.deleted == None)))
    file = file_result.first()
    if file:
        return await enrich_file(db_session, file, profile)
    else:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/by_purpose/{file_purpose}")
async def by_purpose(
        file_purpose: FilePurpose,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> list[FileUploadResponse]:
    """Query a file by its content hash"""
    files = (await db_session.exec((
        select(FileContent)
        .where(FileContent.owner_seq == profile.profile_seq)
        .where(FileContent.purpose == str(file_purpose))
        .where(FileContent.deleted == None)))).all()
    return await enrich_files(db_session, files, profile)


@router.delete("/{file_id}")
async def delete_file_by_id(
        file_id,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)):
    """Delete a file by its ID"""
    return await delete_by_id(file_id, profile, db_session)
