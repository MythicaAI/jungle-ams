""""Define the streaming source from the events table"""
from http import HTTPStatus
from typing import Any

from fastapi import HTTPException
from sqlmodel import select

from auth.api_id import event_id_to_seq, event_seq_to_id
from db.connection import get_session
from db.schema.events import Event as DbEvent
from streaming.funcs import Boundary, Source
from streaming.models import Event, StreamItem


def create_events_table_source(params: dict[str, Any]) -> Source:
    """Constructor of event table result stream sources"""
    page_size = params.get('page_size', 1)
    owner_seq = params.get('owner_seq', None)
    if owner_seq is None:
        raise HTTPException(HTTPStatus.BAD_REQUEST, 'an owner is required for event table streams')

    def events_table_source(boundary: Boundary) -> list[StreamItem]:
        """Function that produces event table result streams"""
        with get_session() as session:
            stmt = select(DbEvent).where(DbEvent.owner_seq == owner_seq)
            if boundary.position is not None:
                event_seq_position = event_id_to_seq(boundary.position)
                if boundary.direction == 'after':
                    stmt = stmt.where(DbEvent.event_seq > event_seq_position)
                else:
                    stmt = stmt.where(DbEvent.event_seq < event_seq_position)
            stmt = stmt.limit(page_size)
            r = session.exec(stmt).all()
            return [Event(
                index=event_seq_to_id(i.event_seq),
                payload=i.job_data,
            ) for i in r]

    return events_table_source
