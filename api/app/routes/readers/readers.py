"""Readers API"""
import logging
from datetime import timezone
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, WebSocketException
from pydantic import TypeAdapter, ValidationError
from sqlmodel import delete as sql_delete, insert, select

from cryptid.cryptid import profile_seq_to_id, reader_id_to_seq, reader_seq_to_id
from db.connection import TZ, get_session
from db.schema.profiles import Profile
from db.schema.streaming import Reader
from ripple.client_ops import ReadClientOp
from ripple.funcs import Boundary
from ripple.models.streaming import StreamItemUnion
from ripple.source_types import create_source
from routes.authorization import current_cookie_profile, maybe_session_profile, session_profile
from routes.readers.manager import ReaderConnectionManager
from routes.readers.schemas import CreateReaderRequest, ReaderResponse
from routes.readers.utils import (direction_db_to_literal, direction_literal_to_db, reader_to_source_params,
                                  resolve_results, select_reader, update_reader_index)

router = APIRouter(prefix="/readers", tags=["readers", "streaming"])
log = logging.getLogger(__name__)

reader_connection_manager = ReaderConnectionManager()


class WebsocketClientOp(ReadClientOp):
    reader_id: Optional[str] = None


@router.post("/", status_code=HTTPStatus.CREATED)
def create(
        create_req: CreateReaderRequest,
        profile: Profile = Depends(session_profile)) -> ReaderResponse:
    """Create a new reader on a source"""
    with get_session() as session:
        r = session.exec(insert(Reader).values(
            source=create_req.source,
            owner_seq=profile.profile_seq,
            name=create_req.name,
            position=create_req.position,
            params=create_req.params,
            direction=direction_literal_to_db(create_req.direction),
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
def current(profile: Profile = Depends(session_profile),
    limit: int = Query(10, le=100),
    offset: int = 0,
) -> list[ReaderResponse]:
    """Get all persistent readers for the current profile"""
    with get_session() as session:
        return resolve_results(session.exec(select(Reader)
            .where(Reader.owner_seq == profile.profile_seq)
            .limit(limit)
            .offset(offset)
        ).all())


@router.delete("/{reader_id}")
def delete(reader_id: str, profile: Profile = Depends(session_profile)):
    """Delete a reader by ID"""
    with get_session() as session:
        reader_seq = reader_id_to_seq(reader_id)
        r = session.exec(sql_delete(Reader)
                         .where(Reader.owner_seq == profile.profile_seq)
                         .where(Reader.reader_seq == reader_seq))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, f"failed to delete reader {reader_id}")
        session.commit()


@router.get("/{reader_id}/items")
async def items(reader_id: str,
                before: Optional[str] = None,
                after: Optional[str] = None,
                profile: Profile = Depends(session_profile)) -> list[StreamItemUnion]:
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


@router.websocket("/test/connect")
async def test_connect(websocket: WebSocket):
    """Connect a websocket for all profile data"""
    await websocket.accept()
    await websocket.send_json(data={'message': 'hello world'}, mode='text')


@router.websocket("/connect")
async def connect_all(
        websocket: WebSocket,
        profile: Profile = Depends(maybe_session_profile),
):
    """Create a profile websocket connection"""
    if not profile:
        # JavaScript does not support headers for WebSocket connections, use cookies instead.
        profile = await current_cookie_profile(websocket)
    try:
        log.info("websocket connected to profile %s", profile)
        await reader_connection_manager.connect(websocket, profile)
    except WebSocketDisconnect:
        log.info("websocket disconnected from profile %s", profile)
        await reader_connection_manager.disconnect(websocket, profile)
    except WebSocketException as e:
        log.exception("websocket exception for profile %s", profile, exc_info=e)
        await reader_connection_manager.disconnect(websocket, profile)
