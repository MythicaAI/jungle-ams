"""Readers API"""
import logging
from datetime import timezone
from http import HTTPStatus
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, WebSocketException
from pydantic import TypeAdapter, ValidationError
from sqlmodel import Session, delete, insert, select, update

from auth.api_id import profile_seq_to_id, reader_id_to_seq, reader_seq_to_id
from db.connection import TZ, get_session
from db.schema.profiles import Profile
from db.schema.streaming import Reader
from routes.authorization import current_profile
from routes.readers.utils import reader_to_source_params, resolve_results, select_reader, update_reader_index
from streaming.models import StreamItemUnion
from routes.readers.manager import ReaderConnectionManager
from routes.readers.schemas import CreateReaderRequest, ReaderResponse
from streaming.client_ops import ClientOp
from streaming.source_types import create_source

router = APIRouter(prefix="/readers", tags=["readers", "streaming"])
log = logging.getLogger(__name__)


reader_connection_manager = ReaderConnectionManager()


class WebsocketClientOp(ClientOp):
    source: str
    reader_id: Optional[str] = None


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
            )
        )
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
        after: Optional[str] = None,
        profile: Profile = Depends(current_profile)) -> list[StreamItemUnion]:
    """Dequeue items from the reader"""
    reader_seq = reader_id_to_seq(reader_id)
    with get_session() as session:
        reader = select_reader(session, reader_seq, profile.profile_seq)
        params = reader_to_source_params(profile, reader)
        source = create_source(reader.source, params)
        if source is None:
            raise HTTPException(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                f"failed to create source for reader {reader_id}")
        default_page_size = 10
        page_size = int(params.get('page_size', default_page_size))
        after = after or reader.position
        raw_items = source(after, page_size)
        if len(raw_items) > 0 and raw_items[-1].index:
            update_reader_index(session, reader.reader_seq, raw_items[-1].index)

        adapter = TypeAdapter(list[StreamItemUnion])
        try:
            return adapter.validate_python(raw_items)
        except ValidationError as e:
            log.exception("failed to validate", exc_info=e)
            raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, # pylint: disable=W0707:raise-missing-from
                                detail=f"validation error for reader {reader_id}")


@router.websocket("/connect")
async def websocket_connect_all(
        op_data: Optional[WebsocketClientOp],
        websocket: WebSocket,
        profile: Profile = Depends(current_profile),
    ):
    """Create a profile websocket connection"""
    try:
        log.info("websocket connected to profile %s", profile)
        await reader_connection_manager.connect(websocket, profile, op_data)
    except WebSocketDisconnect:
        log.info("websocket disconnected from profile %s", profile)
        await reader_connection_manager.disconnect(websocket, profile)
    except WebSocketException as e:
        log.exception("websocket exception for profile %s", profile, exc_info=e)
        await reader_connection_manager.disconnect(websocket, profile)
