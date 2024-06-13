import logging
from typing import Tuple

from uuid import UUID

from config import app_config
from db.schema.media import FileContent
from db.schema.events import Event
from context import RequestContext
from db.connection import get_session
from sqlmodel import insert


log = logging.getLogger(__name__)

FILE_UPLOADED_EVENT = 'file_uploaded:hda'

def update(ctx: RequestContext) -> Tuple[UUID, UUID]:
    """Update the database index for the upload"""
    with get_session() as session:
        content_type = f"application/{ctx.extension}"

        # Create a new upload
        file_content_result = session.exec(insert(FileContent).values(
            {'name': ctx.filename,
             'owner': ctx.profile_id,
             'locators': ctx.locators,
             'content_hash': ctx.content_hash,
             'size': ctx.file_size,
             'content_type': content_type}))
        session.commit()
        file_id = file_content_result.inserted_primary_key[0]

        # Create a new pipeline event
        job_data = {
            'file_id': str(file_id),
            'profile_id': str(ctx.profile_id),
            'locators': ctx.locators,
            'content_type': content_type,
            'content_hash': ctx.content_hash,
            'file_size': ctx.file_size,
            'file_type': ctx.extension
        }
        location = app_config().mythica_location
        event_result = session.exec(insert(Event).values(
            event_type=FILE_UPLOADED_EVENT,
            job_data=job_data,
            owner=ctx.profile_id,
            created_in=location,
            affinity=location))
        session.commit()
        event_id = event_result.inserted_primary_key[0]

    return file_id, event_id
