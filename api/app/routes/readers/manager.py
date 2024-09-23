"""Readers API"""

import json
import logging
from json import JSONDecodeError
from typing import Callable, Optional, TypeVar

from fastapi import WebSocket
from pydantic import TypeAdapter, ValidationError
import redis

from auth.api_id import reader_id_to_seq
from config import app_config
from db.connection import get_session
from db.schema.profiles import Profile
from streaming.client_ops import ClientOp, ReadClientOp
from streaming.funcs import Source
from streaming.models import StreamItem, StreamItemUnion
from db.schema.streaming import Reader
from routes.readers.utils import (
    reader_to_source_params,
    select_profile_readers,
    select_reader,
)
from streaming.source_types import create_source

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
        self.active_connections: dict = {}
        # Define a TypeVar to represent a subtype of BaseType
        self.ops: dict[
            str,
            tuple[
                self.T,
                Callable[[WebSocket, self.T, Source, Reader, bool], None],
            ],
        ] = {'READ': (ReadClientOp, self.process_read)}
        self.default_reader_max_page = 1
        self.default_operation: str = "READ"
        self.default_op: ClientOp = self.ops.get(self.default_operation)

    async def connect(self, websocket: WebSocket, profile: Profile):
        await websocket.accept()
        with get_session() as session:
            readers = select_profile_readers(session, profile.profile_seq)
        log.info("websocket connected to readers %s", readers)
        if readers is None:
            await websocket.send_json({'error': 'There are no readers'})
        for reader in readers:
            processor, data, source = await self.add_reader_to_profile(reader, profile)
            self.active_connections[profile.profile_seq]["websockets"].append(websocket)
            await self.execute_processor(processor, websocket, data, source, reader)
        await self.websocket_handler(websocket, profile)

    async def execute_all_profile_processors(self, payload: dict):

        if not payload or not payload.get("owner_seq"):
            return
        profile_seq = payload.get("owner_seq")

        if (
            not self.active_connections.get(profile_seq)
            or not self.active_connections[profile_seq].get("websockets")
            or not len(self.active_connections[profile_seq]) > 1
        ):
            return
        for reader_id in self.active_connections[profile_seq].keys():
            if not reader_id == "websockets":
                connection_reader = self.active_connections[profile_seq][reader_id]
                reader: Reader = connection_reader["reader"]
                source = connection_reader["source"]
                data = connection_reader["source_data"]
                processor = connection_reader["processor"]
                # TODO: check the name of source
                # target_source = reader.source + "_seq"
                # if not (
                #     i for i in payload.keys()
                #     if i == target_source
                # ):
                #     continue

                for websocket in self.active_connections[profile_seq].get("websockets"):
                    await self.execute_processor(
                        processor, websocket, data, source, reader, completed=True
                    )

    async def get_reader_model(self, reader_seq, profile_seq):
        with get_session() as session:
            reader = select_reader(session, reader_seq, profile_seq)
        return reader

    async def add_reader_to_profile(
        self, reader, profile, op: ClientOp = None, op_data: dict = None
    ):
        params = reader_to_source_params(profile, reader)
        source = create_source(reader.source, params)

        if not self.active_connections.get(profile.profile_seq):
            self.active_connections[profile.profile_seq] = dict()
        if not self.active_connections.get(profile.profile_seq, {}).get(
            reader.reader_seq
        ):
            self.active_connections[profile.profile_seq][reader.reader_seq] = dict()
        if not self.active_connections.get(profile.profile_seq, {}).get("websockets"):
            self.active_connections[profile.profile_seq]["websockets"] = list()

        connection_reader = self.active_connections[profile.profile_seq][
            reader.reader_seq
        ]

        model_type, processor = self.default_op if not op else op
        if not op_data:
            op_data = dict(
                page_size=self.default_reader_max_page,
                op=self.default_operation,
            )
        data = model_type(json=op_data)

        connection_reader["reader"] = reader
        connection_reader["source"] = source
        connection_reader["source_data"] = data
        connection_reader["processor"] = processor
        return processor, data, source

    async def disconnect(self, websocket: WebSocket, profile):
        await websocket.close()
        self.active_connections[profile.profile_seq]["websockets"].remove(websocket)
        if not self.active_connections[profile.profile_seq]["websockets"]:
            del self.active_connections[profile.profile_seq]

    def is_reader_job_completed(self, reader: Reader) -> bool:
        reader_job_name = f"reader_job_{reader.reader_seq}_status"
        reader_job_completed = redis_client.get(reader_job_name)
        if not reader_job_completed or int(reader_job_completed) != 1:
            return False
        return True

    async def websocket_handler(self, websocket: WebSocket, profile):
        """
        Handler loop for web sockets

        Constantly checks the job is completed and processes messages
        """
        while True:
            await self.process_message(websocket, profile)

    async def process_message(self, websocket: WebSocket, profile):
        """Process and respond to a single message"""
        try:
            text = await websocket.receive_text()
            msg = json.loads(text)
            for param in ['op', 'reader_id']:
                if param not in msg:
                    await websocket.send_json(
                        {'error': f"No '{param}' included in client message"}
                    )
                    return

            op_name = msg['op']
            if op_name not in self.ops:
                await websocket.send_json({'error': f"Unknown op {op_name}"})
                return
            reader_seq = reader_id_to_seq(msg['reader_id'])

            if not self.active_connections.get(profile.profile_seq).get(reader_seq):
                reader = await self.get_reader_model(reader_seq, profile.profile_seq)

            reader = self.active_connections[profile.profile_seq][reader_seq]["reader"]
            processor, data, source = await self.add_reader_to_profile(
                reader, profile, self.ops[op_name], msg
            )

        except JSONDecodeError as ex:
            error_message = f"Json decode error for reader {reader_seq}"
            log.exception(error_message, exc_info=ex)
            await websocket.send_json({'error': error_message})

        await self.execute_processor(processor, websocket, data, source, reader)

    async def execute_processor(
        self,
        processor,
        websocket,
        data,
        source,
        reader,
        completed: bool = False,
    ):
        await processor(websocket, data, source, reader, completed)

    async def process_read(
        self,
        websocket: WebSocket,
        op: ReadClientOp,
        source: Source,
        reader: Reader,
        completed: bool = False,
    ):
        """
        Gets a cached reader result or runs the query to obtain the newest result,
        responds with the received data
        """
        cached_result: list[StreamItem] = self.get_redis_reader_result(reader)
        log.info("process_read() reader_seq= %s", reader.reader_seq)

        if not cached_result or (
            completed and not self.is_reader_job_completed(reader)
        ):
            # It allows to run the source only two times
            # The first time it may return an empty list,
            # and the second when it's completed sends the real data,
            # other times it uses cached source data
            cached_result: list[StreamItem] = source(op.after, op.page_size)
            self.set_redis_reader_result(reader, cached_result)
            if completed:
                self.set_redis_reader_completed(reader, completed)

        cached_result = [i.model_dump(mode="json") for i in cached_result]
        await websocket.send_json(json.dumps(cached_result))

    def set_redis_reader_result(
        self,
        reader: Reader,
        items: list[StreamItem],
    ):
        if not items:
            return
        profile_readers_name = f"reader_job_{reader.reader_seq}_result"

        adapter = TypeAdapter(list[StreamItemUnion])
        try:
            data = adapter.validate_python(items)
            data = adapter.dump_json(data)
        except ValidationError as ex:
            log.exception("failed to validate %s", items, exc_info=ex)
            return

        redis_client.set(profile_readers_name, data)
        log.info("redis_client.set job_result for reader %s", reader.reader_seq)

    def set_redis_reader_completed(
        self,
        reader: Reader,
        completed: bool,
    ):
        profile_readers_name = f"reader_job_{reader.reader_seq}_status"

        completed = '1' if completed else '0'
        redis_client.set(profile_readers_name, completed)

    def get_redis_reader_result(self, reader: Reader) -> Optional[dict]:
        profile_readers_name = f"reader_job_{reader.reader_seq}_result"
        items = redis_client.get(profile_readers_name)
        if not items:
            return None
        adapter = TypeAdapter(list[StreamItemUnion])
        try:
            items = adapter.validate_json(items)
            data = adapter.validate_python(items)
        except ValidationError as ex:
            log.exception("failed to validate %s", items, exc_info=ex)
            return
        return data
