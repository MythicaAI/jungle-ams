"""Readers API"""
import logging
from datetime import timezone
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, WebSocketException
from sqlmodel import delete, insert, select

from auth.api_id import profile_seq_to_id, reader_id_to_seq, reader_seq_to_id
from db.connection import TZ, get_session
from db.schema.profiles import Profile
from db.schema.streaming import Reader
from routes.authorization import current_profile
from routes.readers.manager import ReaderConnectionManager
from routes.readers.schemas import CreateReaderRequest, ReaderResponse
from streaming.source_types import create_source

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
        created=r.created.replace(tzinfo=TZ).astimezone(timezone.utc))
        for r in results]
    return resolved


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
        return resolve_results(
            session.exec(select(Reader)
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


@router.websocket("/{reader_id}/connect")
async def websocket_endpoint(
        websocket: WebSocket,
        reader_id: str,
        profile: Profile = Depends(current_profile)):
    """Create a reader websocket connection"""
    await reader_connection_manager.connect(websocket)
    try:
        log.info(f"websocket connected to reader {reader_id}")

        # setup the source
        reader_seq = reader_id_to_seq(reader_id)
        with get_session() as session:
            reader = session.exec(select(Reader)
                                  .where(Reader.reader_seq == reader_seq)
                                  .where(Reader.owner_seq == profile.profile_seq)).one_or_none()
            if reader is None:
                raise HTTPException(HTTPStatus.NOT_FOUND, f"failed to find reader {reader_id}")
            params = reader.params or {}
            params['source'] = reader.source
            params['name'] = reader.name
            params['reader_seq'] = reader_seq
            params['reader_id'] = reader_id
            params['owner_seq'] = profile.profile_seq
            params['owner_id'] = profile_seq_to_id(profile.profile_seq)
            params['created'] = reader.created.replace(tzinfo=TZ).astimezone(timezone.utc)
            params['position'] = reader.position
            source = create_source(reader.source, params)
        await reader_connection_manager.websocket_handler(
            websocket, 
            ReaderResponse(
                source=reader.source,
                name=reader.name,
                position=reader.position,
                reader_id=reader_seq_to_id(reader_seq),
                owner_id=profile_seq_to_id(profile.profile_seq),
                created=reader.created.replace(tzinfo=TZ).astimezone(timezone.utc)
            ),
            source,
        )
    except WebSocketDisconnect:
        log.info(f"websocket disconnected from reader {reader_id}")
        await reader_connection_manager.disconnect(websocket)
    except WebSocketException as e:
        log.exception(f"websocket exception for reader {reader_id}", exc_info=e)
        await reader_connection_manager.disconnect(websocket)
