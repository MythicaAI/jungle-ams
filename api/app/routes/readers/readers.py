"""Readers API"""
import json
import logging
from datetime import datetime, timezone
from http import HTTPStatus
from json import JSONDecodeError
from typing import Any, Callable, Optional, TypeVar

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, WebSocketException
from pydantic import BaseModel, TypeAdapter, ValidationError
from sqlmodel import Session, delete, insert, select, update

from auth.api_id import profile_seq_to_id, reader_id_to_seq, reader_seq_to_id
from db.connection import TZ, get_session
from db.schema.profiles import Profile
from db.schema.streaming import Reader
from routes.authorization import current_profile
from streaming.client_ops import ReadClientOp
from streaming.funcs import Source
from streaming.models import StreamItemUnion
from streaming.source_types import create_source

router = APIRouter(prefix="/readers", tags=["readers", "streaming"])
log = logging.getLogger(__name__)


class ReaderResponse(BaseModel):
    reader_id: str
    owner_id: str
    created: datetime
    source: str
    params: Optional[dict[str, Any]] = None
    name: Optional[str] = None
    position: Optional[str] = None


class CreateReaderRequest(BaseModel):
    source: str
    params: Optional[dict[str, Any]] = None
    name: Optional[str] = None
    position: Optional[str] = None


def resolve_results(results) -> list[ReaderResponse]:
    """Convert database results to API results"""
    resolved = [ReaderResponse(
        reader_id=reader_seq_to_id(r.reader_seq),
        owner_id=profile_seq_to_id(r.owner_seq),
        source=r.source,
        name=r.name,
        position=r.position,
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
    return params


@router.post("/", status_code=HTTPStatus.CREATED)
def create_reader(create: CreateReaderRequest, profile: Profile = Depends(current_profile)) -> ReaderResponse:
    """Create a new reader on a source"""
    with get_session() as session:
        r = session.exec(insert(Reader).values(
            source=create.source,
            owner_seq=profile.profile_seq,
            name=create.name,
            position=create.position))
        if r.rowcount == 0:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, f"failed to create reader")
        session.commit()
        reader_seq = r.inserted_primary_key[0]
        r = session.exec(select(Reader)
                         .where(Reader.reader_seq == reader_seq)
                         .where(Reader.owner_seq == profile.profile_seq))
        reader = r.one_or_none()
        if reader is None:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, f"failed to get created reader")
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
            raise HTTPException(status_code=HTTPStatus.BAD_REQUEST,
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
    await websocket.accept()
    try:
        log.info(f"websocket connected to reader {reader_id}")
        # set up the source
        reader_seq = reader_id_to_seq(reader_id)
        with get_session() as session:
            reader = select_reader(session, reader_seq, profile.profile_seq)
            params = reader_to_source_params(profile, reader)
            source = create_source(reader.source, params)
        await websocket_handler(websocket, reader_id, source)
    except WebSocketDisconnect:
        log.info(f"websocket disconnected from reader {reader_id}")
    except WebSocketException as e:
        log.exception(f"websocket exception for reader {reader_id}", exc_info=e)


async def websocket_handler(websocket: WebSocket, reader_id: str, source: Source):
    """Handler loop for web sockets"""
    while True:
        await process_message(websocket, reader_id, source)


def process_read(websocket: WebSocket, op: ReadClientOp, source: Source):
    """Read data"""
    items = source(op.after, op.page_size)
    for item in items:
        websocket.send_json(item.model_dump())


# Define a TypeVar to represent a subtype of BaseType
T = TypeVar('T', bound='ClientOp')

ops: dict[str, tuple[T, Callable[[WebSocket, T, Source], None]]] = {
    'read': (ReadClientOp, process_read)
}


async def process_message(websocket: WebSocket, reader_id: str, source):
    """Process and respond to a single message"""
    try:
        text = await websocket.receive_text()
        msg = json.loads(text)
        if 'op' not in msg:
            raise HTTPException(HTTPStatus.BAD_REQUEST, f"no 'op' included in client message")
        op_name = msg['op']
        if op_name not in ops:
            raise HTTPException(HTTPStatus.BAD_REQUEST, f"unknown op {op_name}")
        model_type, processor = ops[op_name]
        data = model_type(json=msg)
        processor(websocket, data, source)
        await websocket.send_text(json.dumps({'request': msg}))
    except JSONDecodeError as e:
        log.exception(f"json decode error for reader {reader_id}", exc_info=e)
