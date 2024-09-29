"""Readers API"""
import logging
from datetime import timezone
from http import HTTPStatus
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, WebSocketException
from pydantic import TypeAdapter, ValidationError
from sqlmodel import Session, delete, insert, select, update

from cryptid.cryptid import profile_seq_to_id, reader_id_to_seq, reader_seq_to_id
from db.connection import TZ, get_session
from db.schema.profiles import Profile
from db.schema.streaming import Reader
from routes.authorization import current_profile
from routes.readers.manager import ReaderConnectionManager
from routes.readers.schemas import CreateReaderRequest, Direction, ReaderResponse
from ripple.funcs import Boundary
from ripple.models.streaming import StreamItemUnion
from ripple.source_types import create_source

router = APIRouter(prefix="/readers", tags=["readers", "streaming"])
log = logging.getLogger(__name__)

reader_connection_manager = ReaderConnectionManager()


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


def select_reader(session: Session, reader_seq: int, profile_seq: int) -> Reader:
    """Get a single owned reader"""
    reader = session.exec(select(Reader)
                          .where(Reader.reader_seq == reader_seq)
                          .where(Reader.owner_seq == profile_seq)).one_or_none()
    if reader is None:
        raise HTTPException(
            HTTPStatus.NOT_FOUND,
            f"failed to find reader {reader_seq_to_id(reader_seq)}")
    return reader


def update_reader_index(session: Session, reader_seq: int, index: str):
    """Update the reader with the last read index for seekable streams"""
    r = session.exec(update(Reader)
                     .values(position=index)
                     .where(Reader.reader_seq == reader_seq))
    if r.rowcount == 0:
        log.error("failed to update reader index for reader_seq %s", reader_seq)
    else:
        log.debug("reader_seq %s position moved to index %s", reader_seq, index)
    session.commit()


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


def direction_literal_to_db(direction: Direction) -> int:
    """Convert the direction string literal to a database int"""
    return 1 if direction == 'after' else -1


def direction_db_to_literal(db_direction: int) -> Direction:
    """Convert the database direction int to string"""
    return 'after' if db_direction == 1 else 'before'


@router.post("/", status_code=HTTPStatus.CREATED)
def create_reader(create: CreateReaderRequest, profile: Profile = Depends(current_profile)) -> ReaderResponse:
    """Create a new reader on a source"""
    with get_session() as session:
        r = session.exec(insert(Reader).values(
            source=create.source,
            owner_seq=profile.profile_seq,
            name=create.name,
            position=create.position,
            params=create.params,
            direction=direction_literal_to_db(create.direction),
        ))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "failed to create reader")
        session.commit()
        reader_seq = r.inserted_primary_key[0]
        r = session.exec(select(Reader)
                         .where(Reader.reader_seq == reader_seq)
                         .where(Reader.owner_seq == profile.profile_seq))
        reader = r.one_or_none()
        if reader is None:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "failed to get created reader")
        return ReaderResponse(
            source=reader.source,
            name=reader.name,
            position=reader.position,
            direction=direction_db_to_literal(reader.direction),
            reader_id=reader_seq_to_id(reader_seq),
            owner_id=profile_seq_to_id(profile.profile_seq),
            created=reader.created.replace(tzinfo=TZ).astimezone(timezone.utc))


@router.get("/")
def get_readers(profile: Profile = Depends(current_profile)) -> list[ReaderResponse]:
    """Get all persistent readers for the current profile"""
    with get_session() as session:
        return resolve_results(session.exec(select(Reader)
                                            .where(Reader.owner_seq == profile.profile_seq)).all())


@router.delete("/{reader_id}")
def delete_reader(reader_id: str, profile: Profile = Depends(current_profile)):
    """Delete a reader by ID"""
    with get_session() as session:
        reader_seq = reader_id_to_seq(reader_id)
        r = session.exec(delete(Reader)
                         .where(Reader.owner_seq == profile.profile_seq)
                         .where(Reader.reader_seq == reader_seq))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"failed to delete reader {reader_id}")
        session.commit()


@router.get("/{reader_id}/items")
async def reader_dequeue(
        reader_id: str,
        before: Optional[str] = None,
        after: Optional[str] = None,
        profile: Profile = Depends(current_profile)) -> list[StreamItemUnion]:
    """Dequeue items from the reader"""
    reader_seq = reader_id_to_seq(reader_id)
    with get_session() as session:
        reader = select_reader(session, reader_seq, profile.profile_seq)
        params = reader_to_source_params(profile, reader)
        source = create_source(reader.source, params)
        if before is not None:
            boundary = Boundary(position=before, direction='before')
        elif after is not None:
            boundary = Boundary(position=after, direction='after')
        else:
            boundary = Boundary(position=reader.position, direction=direction_db_to_literal(reader.direction))
        if source is None:
            raise HTTPException(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                f"failed to create source for reader {reader_id}")

        raw_items = source(boundary)
        if len(raw_items) > 0 and raw_items[-1].index:
            update_reader_index(session, reader.reader_seq, raw_items[-1].index)

        adapter = TypeAdapter(list[StreamItemUnion])
        try:
            return adapter.validate_python(raw_items)
        except ValidationError as e:
            log.exception("failed to validate", exc_info=e)
            raise HTTPException(status_code=HTTPStatus.BAD_REQUEST,  # pylint: disable=W0707:raise-missing-from
                                detail=f"validation error for reader {reader_id}")


@router.websocket("/connect")
async def websocket_connect_all(websocket: WebSocket):
    """Connect a websocket for all profile data"""
    await websocket.accept()
    await websocket.send_json(data={'message': 'hello world'}, mode='text')


@router.websocket("/{reader_id}/connect")
async def websocket_endpoint(
        websocket: WebSocket,
        reader_id: str,
        profile: Profile = Depends(current_profile)):
    """Create a reader websocket connection"""
    await reader_connection_manager.connect(websocket)
    try:
        log.info("websocket connected to reader %s", reader_id)
        # set up the source
        reader_seq = reader_id_to_seq(reader_id)
        with get_session() as session:
            reader = select_reader(session, reader_seq, profile.profile_seq)
            params = reader_to_source_params(profile, reader)
            source = create_source(reader.source, params)
        await reader_connection_manager.websocket_handler(
            websocket,
            ReaderResponse(
                source=reader.source,
                name=reader.name,
                position=reader.position,
                direction=direction_db_to_literal(reader.direction),
                reader_id=reader_seq_to_id(reader_seq),
                owner_id=profile_seq_to_id(profile.profile_seq),
                created=reader.created.replace(tzinfo=TZ).astimezone(timezone.utc)
            ),
            source,
        )
    except WebSocketDisconnect:
        log.info("websocket disconnected from reader %s", reader_id)
        await reader_connection_manager.disconnect(websocket)
    except WebSocketException as e:
        log.exception("websocket exception for reader %s", reader_id, exc_info=e)
        await reader_connection_manager.disconnect(websocket)
