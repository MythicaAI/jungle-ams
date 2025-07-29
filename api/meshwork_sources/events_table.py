""""Define the streaming source from the events table"""
from http import HTTPStatus
from typing import Any, AsyncIterator

from db.connection import db_session_pool
from db.schema.events import Event as DbEvent
from fastapi import FastAPI, HTTPException
from gcid.gcid import event_id_to_seq, event_seq_to_id
from meshwork.funcs import Boundary, Source
from meshwork.models.streaming import Event, StreamItem
from sqlalchemy import asc
from sqlmodel import select


def create_events_table_source(app: FastAPI, params: dict[str, Any]) -> Source:
    """Constructor of event table result stream sources"""
    page_size = params.get("page_size", 1)
    owner_seq = params.get("owner_seq", None)
    if owner_seq is None:
        raise HTTPException(HTTPStatus.BAD_REQUEST, "an owner is required for event table streams")

    async def events_table_source(boundary: Boundary) -> AsyncIterator[StreamItem]:
        """Function that produces event table result streams"""
        # pylint disable=F824
        # (pylint doesn't understand this nonlocal usage)
        nonlocal app

        async with db_session_pool(app) as db_session:
            stmt = select(DbEvent).where(DbEvent.owner_seq == owner_seq)
            if boundary.position is not None:
                event_seq_position = event_id_to_seq(boundary.position)
                if boundary.direction == "after":
                    stmt = stmt.where(DbEvent.event_seq > event_seq_position)
                else:
                    stmt = stmt.where(DbEvent.event_seq < event_seq_position)
            stmt = stmt.order_by(asc(DbEvent.event_seq)).limit(page_size)
            r = (await db_session.exec(stmt)).all()
            for i in r:
                e = Event(
                    index=event_seq_to_id(i.event_seq),
                    payload=i.job_data,
                    event_type=i.event_type,
                    queued=i.queued,
                    acked=i.acked,
                    completed=i.completed)
                yield e

    return events_table_source
