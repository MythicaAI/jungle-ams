"""Readers API"""

import json
import logging
from http import HTTPStatus
from json import JSONDecodeError
from typing import Callable, Optional, TypeVar

from fastapi import HTTPException, WebSocket
import redis

from config import app_config
from streaming.client_ops import ClientOp, ReadClientOp
from streaming.funcs import Source
from streaming.models import StreamItem
from routes.readers.schemas import ReaderResponse

log = logging.getLogger(__name__)



configs = app_config()

try:
    redis_client = redis.Redis(
        host=configs.redis_host, port=configs.redis_port, decode_responses=True
    )
except redis.ConnectionError as e:
    log.error("Redis connection failed", exc_info=e)
    raise e


class ReaderConnectionManager:
    T = TypeVar('T', bound=ClientOp)

    def __init__(self):
        self.active_connections: list[WebSocket] = []
        # Define a TypeVar to represent a subtype of BaseType
        self.ops: dict[
            str, tuple[self.T, Callable[[WebSocket, self.T, Source, ReaderResponse, bool], None]]
        ] = {'READ': (ReadClientOp, self.process_read)}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        await websocket.close()
        self.active_connections.remove(websocket)

    def is_reader_job_completed(self, reader: ReaderResponse) -> bool:
        reader_job_name = f"reader_job_{reader.owner_id}_completed"
        reader_job_completed = redis_client.get(reader_job_name)
        if not reader_job_completed or int(reader_job_completed) != 1:
            return False
        return True

    async def websocket_handler(
        self, websocket: WebSocket, reader: ReaderResponse, source: Source
    ):
        """
        Handler loop for web sockets

        Constantly checks the job is completed and processes messages
        """
        while True:
            await self.process_message(websocket, reader, source)

    async def process_message(
        self, websocket: WebSocket, reader: ReaderResponse, source
    ):
        """Process and respond to a single message"""
        try:
            text = await websocket.receive_text()
            msg = json.loads(text)
            if 'op' not in msg:
                await websocket.send_json({'error': "No 'op' included in client message"})
                return

            op_name = msg['op']
            if op_name not in self.ops:
                await websocket.send_json({'error': f"Unknown op {op_name}"})
                return

            model_type, processor = self.ops[op_name]
            data = model_type(json=msg)
            await processor(websocket, data, source, reader)
        except JSONDecodeError as e:
            error_message = f"Json decode error for reader {reader.reader_id}"
            log.exception(
                error_message, exc_info=e
            )
            await websocket.send_json({'error': error_message})

    async def process_read(
        self,
        websocket: WebSocket,
        op: ReadClientOp,
        source: Source,
        reader: ReaderResponse,
    ):
        """
        Gets a cached reader result or runs the query to obtain the newest result,
        responds with the received data
        """
        cached_reader = self.get_redis_reader(reader)
        completed = self.is_reader_job_completed(reader)

        if not cached_reader or (completed and cached_reader["completed"] is False):
            # It allows to run the source only two times
            # The first time it may return an empty list,
            # and the second when it's completed sends the real data,
            # other times it uses cached source data
            stream_items: list[StreamItem] = source(op.after, op.max_page)
            cached_reader = self.set_redis_reader(reader, stream_items, completed)
        items: list[dict] = cached_reader["result"]

        await websocket.send_json(items)

    def set_redis_reader(
        self, reader: ReaderResponse, items: list[StreamItem], completed=False
    ):
        profile_readers_name = f"readers_{reader.owner_id}"
        data = {
            "result": [item.model_dump() for item in items],
            "completed": completed,
        }
        redis_client.hset(profile_readers_name, reader.reader_id, json.dumps(data))
        return data

    def get_redis_reader(self, reader: ReaderResponse) -> Optional[dict]:
        profile_readers_name = f"readers_{reader.owner_id}"
        data = redis_client.hget(profile_readers_name, reader.reader_id)
        if not data:
            return None
        return json.loads(data)
