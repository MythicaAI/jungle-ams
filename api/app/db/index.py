import sys
import logging
from typing import Tuple

from sqlmodel import insert
from uuid import uuid4

from cryptid.cryptid import event_seq_to_id, file_seq_to_id
from cryptid.location import location
from context import RequestContext
from db.connection import get_session
from db.schema.events import Event
from db.schema.media import FileContent
from ripple.automation.adapters import NatsAdapter
from ripple.automation.models import AutomationRequest
from ripple.automation.worker import process_guid
from ripple.models.params import FileParameter, ParameterSet
from telemetry_config import get_telemetry_context


log = logging.getLogger(__name__)


async def update(ctx: RequestContext) -> Tuple[str, str]:
    """Update the database index for the upload"""
    with get_session() as session:
        content_type = f"application/{ctx.extension}"

        # if the locators format changes we can add a different key
        locators = {'locators': ctx.locators}

        # create a new upload
        file_content_result = session.exec(insert(FileContent).values(
            {'name': ctx.filename,
             'owner_seq': ctx.profile.profile_seq,
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
            'profile_id': ctx.profile.profile_id,
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
            owner_seq=ctx.profile.profile_seq,
            created_in=loc,
            affinity=loc))
        session.commit()
        event_seq = event_result.inserted_primary_key[0]
        event_id = event_seq_to_id(event_seq)

        # Create a new NATS event
        if should_post_to_nats(ctx):
            parameter_set = ParameterSet(
                hda_file = FileParameter(file_id=file_id)
            )

            event = AutomationRequest(
                process_guid=process_guid,
                work_guid=str(uuid4()),
                auth_token=ctx.profile.auth_token,
                path='/mythica/generate_job_defs',
                data=parameter_set.model_dump(),
                context=get_telemetry_context(),
            )

            nats = NatsAdapter()
            log.info("Sent NATS houdini task. Request: %s", event.model_dump())
            await nats.post("houdini", event.model_dump())

    return file_id, event_id

def should_post_to_nats(ctx: RequestContext) -> bool:
    if not ctx.extension in ('hda', 'hdalc'):
        return False
    if "pytest" in sys.argv[0] or "pytest" in sys.modules:
        return False
    return True