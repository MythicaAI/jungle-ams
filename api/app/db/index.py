import asyncio
import logging
from typing import Tuple

from sqlmodel import insert
from uuid import uuid4

from cryptid.cryptid import event_seq_to_id, file_seq_to_id, profile_id_to_seq
from cryptid.location import location
from context import RequestContext
from db.connection import get_session
from db.schema.events import Event
from db.schema.media import FileContent
from ripple.automation import NatsAdapter, WorkerRequest
from ripple.models.params import FileParameter, ParameterSet


log = logging.getLogger(__name__)


def update(ctx: RequestContext) -> Tuple[str, str]:
    """Update the database index for the upload"""
    with get_session() as session:
        content_type = f"application/{ctx.extension}"

        # if the locators format changes we can add a different key
        locators = {'locators': ctx.locators}

        # create a new upload
        file_content_result = session.exec(insert(FileContent).values(
            {'name': ctx.filename,
             'owner_seq': profile_id_to_seq(ctx.profile_id),
             'locators': locators,
             'purpose': ctx.purpose,
             'content_hash': ctx.content_hash,
             'size': ctx.file_size,
             'content_type': content_type}))
        session.commit()
        file_id = file_seq_to_id(file_content_result.inserted_primary_key[0])

        # Create a new pipeline event
        job_data = {
            'file_id': file_id,
            'profile_id': ctx.profile_id,
            'locators': locators,
            'content_type': content_type,
            'content_hash': ctx.content_hash,
            'file_size': ctx.file_size,
            'file_type': ctx.extension
        }
        loc = location()
        event_result = session.exec(insert(Event).values(
            event_type=f"file_uploaded:{ctx.extension}",
            job_data=job_data,
            owner_seq=profile_id_to_seq(ctx.profile_id),
            created_in=loc,
            affinity=loc))
        session.commit()
        event_seq = event_result.inserted_primary_key[0]
        event_id = event_seq_to_id(event_seq)

        # Create a new NATS event
        if ctx.extension in ('hda', 'hdalc', 'hdanc'):
            parameter_set = ParameterSet(
                hda_file = FileParameter(file_id=file_id)
            )

            event = WorkerRequest(
                work_id=str(uuid4()),
                path='/mythica/generate_job_defs',
                data=parameter_set.model_dump()
            )

            nats = NatsAdapter()
            asyncio.create_task(nats.post("houdini", event.model_dump()))

    return file_id, event_id
