from sqlmodel import Session, select

from db.schema.events import Event
from db.schema.media import FileContent
from db.schema.profiles import Profile
from routes.responses import FileUploadResponse


def enrich_file(
        session: Session,
        file: FileContent,
        profile: Profile) -> FileUploadResponse:
    """Given a file and a profile, enrich with events associated to the file"""
    owned_events = session.exec(select(Event).where(
        Event.owner == profile.id)).all()

    response = FileUploadResponse(
        file_id=file.id,
        owner=file.owner,
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
        if file_id == file.id:
            response.event_ids.append(oe.id)

    return response


def enrich_files(
        session: Session,
        files: list[FileContent],
        profile: Profile) -> list[FileUploadResponse]:
    """Given a list of files and a profile, enrich with events associated to the files"""
    owned_events = session.exec(select(Event).where(
        Event.owner == profile.id)).all()
    owned_files_by_id = {}
    for of in files:
        if type(of.locators) is list:
            locators = of.locators
        elif type(of.locators) is dict:
            locators = of.locators.get('locators', [])
        else:
            locators = []
        owned_files_by_id[of.id] = FileUploadResponse(
            file_id=of.id,
            owner=of.owner,
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
        of.event_ids.append(oe.id)
    return list(owned_files_by_id.values())
