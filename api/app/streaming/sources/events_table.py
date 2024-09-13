""""Define the streaming source from the events table"""
from http import HTTPStatus
from typing import Any

from fastapi import HTTPException
from sqlmodel import select

from auth.api_id import event_id_to_seq, event_seq_to_id
from db.connection import get_session
from db.schema.events import Event as DbEvent
from streaming.funcs import Source
from streaming.models import Event, StreamItem


def create_events_table_source(params: dict[str, Any]) -> Source:
    """Constructor of event table result stream sources"""
    param_max_page = params.get('max_page', 1)
    param_owner_seq = params.get('owner_seq', None)
    if param_owner_seq is None:
        raise HTTPException(HTTPStatus.BAD_REQUEST, 'an owner is required for event table streams')

    def events_table_source(after: str, max_page: int) -> list[StreamItem]:
        """Function that produces event table result streams"""
        max_page = min(param_max_page, max_page)
        after_events_seq = event_id_to_seq(after) if after else 0
        with get_session() as session:
            if not after:
                r = session.exec(select(DbEvent)
                                 .where(Event.owner_seq == param_owner_seq)
                                 .limit(max_page)).all()
            else:
                r = session.exec(select(DbEvent)
                                 .where(DbEvent.owner_seq == param_owner_seq)
                                 .where(DbEvent.event_seq > after_events_seq)
                                 .limit(max_page)).all()

        return [Event(
            event_id=event_seq_to_id(i.event_seq),
            payload=i.payload,
        ) for i in r]

    return events_table_source
