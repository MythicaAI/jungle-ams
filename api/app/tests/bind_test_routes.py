from datetime import datetime
from http import HTTPStatus
from http.client import HTTPException
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import desc, insert, select, update
from sqlmodel.ext.asyncio.session import AsyncSession

from cryptid.cryptid import event_id_to_seq, event_seq_to_id, profile_id_to_seq
from db.connection import get_db_session
from db.schema.events import Event
from db.schema.profiles import ProfileKey
from profiles.start_session import start_session

router = APIRouter(prefix='/test')


@router.get('/start_session/{session_profile_id}', tags=['test'])
async def start_test_session_async(
        session_profile_id: str,
        as_profile_id: Optional[str] = None,
        db_session: AsyncSession = Depends(get_db_session)):
    """Test only route to directly generate a session, this is done on
    a route to ensure that the async context for the database matches
    what has been configured already in the application startup"""
    session_start_response = await start_session(
        db_session,
        profile_id_to_seq(session_profile_id),
        location='test-case',
        impersonate_profile_id=as_profile_id)
    auth_token = session_start_response.token
    return {'token': auth_token}


@router.post('/events', tags=['test'], status_code=HTTPStatus.CREATED)
async def create_event(events: list[Event], db_session: AsyncSession = Depends(get_db_session)) -> list[str]:
    """Create events for testing, returns the event IDs that were generated"""
    inserted_events = []
    allowed_fields = {'event_type', 'job_data', 'owner_seq', 'affinity', 'created_in'}
    for e in events:
        values = {key: value for key, value in e.model_dump().items() if key in allowed_fields}
        inserted_events.append(await db_session.exec(insert(Event).values(**values)))
    await db_session.commit()
    return [event_seq_to_id(e.inserted_primary_key[0]) for e in inserted_events]


class EventMultipleRequest(BaseModel):
    """A test request for multiple event IDs to be resolved by the DB in the FastAPI context"""
    event_ids: list[str]


@router.post('/events/multiple', tags=['test'])
async def get_event_dumped_models(
        req_data: EventMultipleRequest,
        db_session: AsyncSession = Depends(get_db_session)) -> list[Event]:
    event_seqs = [event_id_to_seq(x) for x in req_data.event_ids]
    statement = (
        select(Event)
        .where(Event.event_seq.in_(event_seqs))  # pylint: disable=no-member
        .order_by(Event.event_seq)
    )
    events = (await db_session.exec(statement)).all()
    return events


@router.get('/events/{event_id}', tags=['test'])
async def get_event_by_id(event_id: str, db_session: AsyncSession = Depends(get_db_session)) -> Event:
    """Get an event by ID"""
    event = (await db_session.exec(select(Event)
                                   .where(Event.event_seq == event_id_to_seq(event_id)))).one_or_none()
    if event is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, f"event {event_id} not found")
    return event


@router.get('/email-validation-key/{profile_id}', tags=['test'])
async def get_email_validation_key(
        profile_id: str,
        db_session: AsyncSession = Depends(get_db_session)):
    db_profile = (await db_session.exec(select(ProfileKey).where(
        ProfileKey.owner_seq == profile_id_to_seq(profile_id)).order_by(desc(ProfileKey.created)))).one_or_none()
    if db_profile is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, f"profile {profile_id} not found")
    return {'key': db_profile.key}


class ExtendValidationTime(BaseModel):
    key: str
    expires: datetime


@router.post('/email-validation-key-expires', tags=['test'])
async def set_email_validation_expires(
        expire_req: ExtendValidationTime,
        db_session: AsyncSession = Depends(get_db_session)):
    update_result = await db_session.exec(
        update(ProfileKey).where(ProfileKey.key == expire_req.key).values(expires=expire_req.expires))
    await db_session.commit()
    if update_result.rowcount != 1:
        raise HTTPException(HTTPStatus.NOT_FOUND, f"profile {key} not found")


def bind_test_routes(app):
    """Bind all test routes to the application

    These routes are used to forward database calls the starlette anyio blocking portal so that
    the async context matches the underlying async database engine"""
    app.include_router(router)
