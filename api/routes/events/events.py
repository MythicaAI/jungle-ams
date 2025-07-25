import logging
from http import HTTPStatus

from gcid.gcid import event_id_to_seq
from db.connection import get_db_session
from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from meshwork.automation.models import EventAutomationResponse
from meshwork.models.sessions import SessionProfile
from routes.authorization import session_profile
from routes.events import query as event_query
from repos import events as event_repo
from routes.events.models import EventUpdateResponse
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel.ext.asyncio.session import AsyncSession

log = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)

router = APIRouter(prefix="/events", tags=["jobs", "events"])


@router.post("/processed/{event_id}/")
async def update_events_result_data(
        event_id: str,
        data: EventAutomationResponse,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session),
) -> EventUpdateResponse:
    """Updates event table if event is processed"""
    event_seq = event_id_to_seq(event_id)
    event = await event_query.get_event_by_seq(event_seq, db_session)
    if not event:
        mess = f"There is no event. event_id-{event_id}"
        log.error(mess)
        raise HTTPException(HTTPStatus.NOT_FOUND, detail=mess)
    if event.owner_seq != profile.profile_seq:
        mess = "Event can be updated only by owner."
        log.warning(mess)
        raise HTTPException(
            HTTPStatus.FORBIDDEN,
            detail=f"{mess}: item_data-{data.model_dump()}, event_id-{event_id}",
        )
    job_result_data = event_repo.update_or_create_event_automation(data, event)
    update_result = await event_query.update_events_result_data(
        event_seq,
        event_data={
            "job_result_data": job_result_data.model_dump(),
            "completed": sql_now() if job_result_data.processed else None,
        },
        profile=profile,
        db_session=db_session,
    )
    if update_result.rowcount != 1:
        log.error(
            "Event not updated. event_id-%s, item_data-%s",
            event_id,
            data.model_dump(),
        )
        raise HTTPException(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            detail=f"Event not updated. event_id-{event_id}",
        )
    log.info(
        "Event marked as completed successfully: item_data-%s, event_id-%s",
        data.model_dump(),
        event_id,
    )
    await db_session.commit()
    event = await event_query.get_event_by_seq(event_seq, db_session)
    return EventUpdateResponse(
        event_id=event_id,
        event_type=event.event_type,
        job_result_data=job_result_data,
        completed=event.completed,
        job_data=event.job_data,
        owner_id=profile.profile_id,
        created_in=event.created_in,
        affinity=event.affinity,
    )
