from uuid import UUID

from db.schema.media import FileContent
from db.schema.events import Event
from context import RequestContext
from db.connection import get_session
from flask import jsonify


def update(ctx: RequestContext) -> UUID:
    """Update the database index for the upload"""
    # Begin a transaction
    session = get_session()

    content_type = f"application/{ctx.extension}"

    # Create a new upload
    upload = FileContent(
        name=ctx.filename,
        owner=ctx.user,
        locators=jsonify(ctx.locators),
        content_hash=ctx.content_hash,
        size=ctx.file_size,
        content_type=content_type)
    session.add(upload)
    session.commit()

    job_data = {'locators': ctx.locators,
                'content_type': content_type,
                'file_size': ctx.file_size,
                'file_type': ctx.extension}

    # Create a new pipeline event
    event = Event(
        event_type='file_uploaded',
        job_data=job_data)
    session.add(event)
    session.commit()

    session.refresh(event)
    return event.id
