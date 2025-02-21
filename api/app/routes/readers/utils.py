"""Readers API"""
from http import HTTPStatus

import logging
from datetime import timezone
from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select, update
from typing import Any
from sqlmodel import select, update
from sqlmodel.ext.asyncio.session import AsyncSession

from cryptid.cryptid import profile_seq_to_id, reader_seq_to_id
from db.connection import TZ
from db.schema.profiles import Profile
from db.schema.streaming import Reader
from routes.readers.schemas import Direction, ReaderResponse

router = APIRouter(prefix="/readers", tags=["readers", "streaming"])
log = logging.getLogger(__name__)


def direction_literal_to_db(direction: Direction) -> int:
    """Convert the direction string literal to a database int"""
    return 1 if direction == 'after' else -1


def direction_db_to_literal(db_direction: int) -> Direction:
    """Convert the database direction int to string"""
    return 'after' if db_direction == 1 else 'before'


def resolve_results(results) -> list[ReaderResponse]:
    """Convert database results to API results"""
    resolved = [ReaderResponse(
        reader_id=reader_seq_to_id(r.reader_seq),
        owner_id=profile_seq_to_id(r.owner_seq),
        source=r.source,
        name=r.name,
        position=r.position,
        direction=direction_db_to_literal(r.direction),
        created=r.created.replace(tzinfo=TZ).astimezone(timezone.utc))
        for r in results]
    return resolved


async def select_reader(db_session: AsyncSession, reader_seq: int, profile_seq: int) -> Reader:
    """Get a single owned reader"""
    reader = (await db_session.exec(select(Reader)
                                    .where(Reader.reader_seq == reader_seq)
                                    .where(Reader.owner_seq == profile_seq))).one_or_none()
    if reader is None:
        raise HTTPException(
            HTTPStatus.NOT_FOUND,
            f"failed to find reader {reader_seq_to_id(reader_seq)}")
    return reader


async def select_profile_readers(
        db_session: AsyncSession,
        profile_seq: int) -> list[Reader]:
    """Get all owned readers for this profile"""
    readers = (await db_session.exec(select(Reader)
                           .where(Reader.owner_seq == profile_seq).order_by("reader_seq"))).all()
    return readers


async def update_reader_index(
        db_session: AsyncSession,
        reader_seq: int,
        index: str):
    """Update the reader with the last read index for seekable streams"""
    r = await db_session.exec(update(Reader)
                              .values(position=index)
                              .where(Reader.reader_seq == reader_seq))
    if r.rowcount == 0:
        log.error("failed to update reader index for reader_seq %s", reader_seq)
    else:
        log.debug("reader_seq %s position moved to index %s", reader_seq, index)
    await db_session.commit()


def reader_to_source_params(profile: Profile, reader: Reader) -> dict[str, Any]:
    """Generate the source params from a reader"""
    params = reader.params or dict()
    params['source'] = reader.source
    params['name'] = reader.name
    params['reader_seq'] = reader.reader_seq
    params['reader_id'] = reader_seq_to_id(reader.reader_seq)
    params['owner_seq'] = profile.profile_seq
    params['owner_id'] = profile_seq_to_id(profile.profile_seq)
    params['created'] = reader.created.replace(tzinfo=TZ).astimezone(timezone.utc)
    params['position'] = reader.position
    params['direction'] = direction_db_to_literal(reader.direction)
    return params
