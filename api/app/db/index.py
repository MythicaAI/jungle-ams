import logging
from typing import Tuple
from uuid import UUID

from sqlmodel import insert

from config import app_config
from context import RequestContext
from db.connection import get_session
from db.schema.events import Event
from db.schema.media import FileContent

log = logging.getLogger(__name__)


def update(ctx: RequestContext) -> Tuple[UUID, UUID]:
    """Update the database index for the upload"""
    with get_session() as session:
        content_type = f"application/{ctx.extension}"

        # if the locators format changes we can add a different key
        locators = {'locators': ctx.locators}

        # create a new upload
        file_content_result = session.exec(insert(FileContent).values(
            {'name': ctx.filename,
             'owner_id': ctx.profile_id,
             'locators': locators,
             'content_hash': ctx.content_hash,
             'size': ctx.file_size,
             'content_type': content_type}))
        session.commit()
        file_id = file_content_result.inserted_primary_key[0]

        # Create a new pipeline event
        job_data = {
            'file_id': str(file_id),
            'profile_id': str(ctx.profile_id),
            'locators': locators,
            'content_type': content_type,
            'content_hash': ctx.content_hash,
            'file_size': ctx.file_size,
            'file_type': ctx.extension
        }
        location = app_config().mythica_location
        event_result = session.exec(insert(Event).values(
            event_type=f"file_uploaded:{ctx.extension}",
            job_data=job_data,
            owner_id=ctx.profile_id,
            created_in=location,
            affinity=location))
        session.commit()
        event_id = event_result.inserted_primary_key[0]

    return file_id, event_id
