from typing import Optional

from db.connection import get_db_session
from db.schema.events import Event
from fastapi import Depends
from ripple.models.sessions import SessionProfile
from routes.authorization import session_profile
from sqlmodel import select, update
from sqlmodel.ext.asyncio.session import AsyncSession


async def get_event_by_seq(
    event_seq: int,
    db_session: AsyncSession = Depends(get_db_session),
) -> Optional[Event]:
    """Get event by event_seq"""
    event = (
        await db_session.exec(select(Event).where(Event.event_seq == event_seq))
    ).first()
    return event


async def update_events_result_data(
    event_seq: int,
    event_data: dict,
    profile: SessionProfile = Depends(session_profile),
    db_session: AsyncSession = Depends(get_db_session),
) -> Event:
    """Updates event table if event is processed"""
    update_result = await db_session.exec(
        update(Event)
        .values(**event_data)
        .where(
            Event.event_seq == event_seq,
            Event.owner_seq == profile.profile_seq,
        )
    )
    return update_result
