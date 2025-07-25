import logging
import sys
from typing import Tuple
from uuid import uuid4

from sqlmodel import insert
from sqlmodel.ext.asyncio.session import AsyncSession

from context import UploadContext
from gcid.gcid import event_seq_to_id, file_seq_to_id, profile_id_to_seq
from gcid.location import location
from db.schema.events import Event
from db.schema.media import FileContent
from meshwork.automation.adapters import NatsAdapter
from meshwork.automation.models import AutomationRequest
from meshwork.automation.worker import process_guid
from meshwork.models.params import FileParameter, ParameterSet
from telemetry_config import get_telemetry_headers

log = logging.getLogger(__name__)


async def update(db_session: AsyncSession, ctx: UploadContext) -> Tuple[str, str]:
    """Update the database index for the upload"""
    content_type = f"application/{ctx.extension}"

    # if the locators format changes we can add a different key
    locators = {'locators': ctx.locators}

    # create a new upload
    insert_stmt = insert(FileContent).values(
        name=ctx.filename,
        owner_seq=profile_id_to_seq(ctx.owner_id),
        locators=locators,
        purpose=str(ctx.purpose),
        content_hash=ctx.content_hash,
        size=ctx.file_size,
        content_type=content_type)
    file_content_result = await db_session.exec(insert_stmt)
    await db_session.commit()
    file_id = file_seq_to_id(file_content_result.inserted_primary_key[0])

    # Create a new pipeline event
    job_data = {
        'file_id': file_id,
        'profile_id': ctx.owner_id,
        'locators': locators,
        'content_type': content_type,
        'content_hash': ctx.content_hash,
        'file_size': ctx.file_size,
        'file_type': ctx.extension
    }
    loc = location()
    event_result = await db_session.exec(insert(Event).values(
        event_type=f"file_uploaded:{ctx.extension}",
        job_data=job_data,
        owner_seq=profile_id_to_seq(ctx.owner_id),
        created_in=loc,
        affinity=loc))
    await db_session.commit()
    event_seq = event_result.inserted_primary_key[0]
    event_id = event_seq_to_id(event_seq)

    # Create a new NATS event
    if should_post_to_nats(ctx):
        parameter_set = ParameterSet(
            hda_file=FileParameter(file_id=file_id),
            dependencies=[],
            src_asset_id="",
            src_version=[0, 0, 0],
        )

        event = AutomationRequest(
            process_guid=process_guid,
            correlation=str(uuid4()),
            auth_token=ctx.profile.auth_token,
            path='/mythica/generate_job_defs',
            data=parameter_set.model_dump(),
            telemetry_context=get_telemetry_headers(),
        )

        nats = NatsAdapter()
        log.info("Sent NATS houdini task. Request: %s", event.model_dump())
        await nats.post("houdini", event.model_dump())

    return file_id, event_id


def should_post_to_nats(ctx: UploadContext) -> bool:
    if not ctx.extension in ('hda', 'hdalc'):
        return False
    if "pytest" in sys.argv[0] or "pytest" in sys.modules:
        return False
    return True
