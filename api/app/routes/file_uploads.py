from datetime import datetime

from pydantic import BaseModel
from sqlmodel import Session, select

from auth.api_id import event_seq_to_id, file_seq_to_id, profile_seq_to_id
from db.schema.events import Event
from db.schema.media import FileContent
from db.schema.profiles import Profile


class FileUploadResponse(BaseModel):
    file_id: str
    owner_id: str
    file_name: str
    event_ids: list[str]
    size: int
    content_type: str
    content_hash: str = ""
    created: datetime


def enrich_file(
        session: Session,
        file: FileContent,
        profile: Profile) -> FileUploadResponse:
    """Given a file and a profile, enrich with events associated to the file"""
    owned_events = session.exec(select(Event).where(
        Event.owner_seq == profile.profile_seq)).all()

    response = FileUploadResponse(
        file_id=file_seq_to_id(file.file_seq),
        owner_id=profile_seq_to_id(file.owner_seq),
        file_name=file.name,
        content_type=file.content_type,
        size=file.size,
        created=file.created,
        event_ids=[],
        content_hash=file.content_hash,
    )

    for oe in owned_events:
        job_data = oe.job_data
        file_id = job_data.get('file_id')
        if file_id == file_seq_to_id(file.file_seq):
            response.event_ids.append(event_seq_to_id(oe.event_seq))

    return response


def enrich_files(
        session: Session,
        files: list[FileContent],
        profile: Profile) -> list[FileUploadResponse]:
    """Given a list of files and a profile, enrich with events associated to the files"""
    owned_events = session.exec(select(Event).where(
        Event.owner_seq == profile.profile_seq)).all()
    owned_files_by_id = {}
    for of in files:
        file_id = file_seq_to_id(of.file_seq)
        owned_files_by_id[file_id] = FileUploadResponse(
            file_id=file_id,
            owner_id=profile_seq_to_id(of.owner_seq),
            file_name=of.name,
            content_type=of.content_type,
            size=of.size,
            created=of.created,
            event_ids=[],
            content_hash=of.content_hash,
        )
    for oe in owned_events:
        job_data = oe.job_data
        file_id = job_data.get('file_id')
        if file_id is None:
            continue
        of = owned_files_by_id.get(file_id)
        if of is None:
            continue
        of.event_ids.append(event_seq_to_id(oe.event_seq))
    return list(owned_files_by_id.values())
