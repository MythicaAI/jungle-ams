"""Readers API"""

import asyncio
import json
import logging
from json import JSONDecodeError
from typing import Callable, TypeVar

from fastapi import WebSocket

from cryptid.cryptid import reader_id_to_seq
from config import app_config
from db.connection import get_session
from db.schema.profiles import Profile
from ripple.client_ops import ClientOp, ReadClientOp
from ripple.funcs import Boundary, Source
from ripple.models.streaming import StreamItem
from db.schema.streaming import Reader
from routes.readers.utils import (
    reader_to_source_params,
    select_profile_readers,
    select_reader,
)
from ripple.source_types import create_source

log = logging.getLogger(__name__)
configs = app_config()


class ApiWebsocketError(Exception):
    pass


class ReaderConnectionManager:
    T = TypeVar('T', bound=ClientOp)

    def __init__(self):
        self.active_connections: dict = {}
        # Define a TypeVar to represent a subtype of BaseType
        self.ops: dict[
            str,
            tuple[
                self.T,
                Callable[[self.T, Source], None],
            ],
        ] = {'READ': (ReadClientOp, self.process_read)}
        self.default_reader_max_page = 1
        self.default_operation: str = "READ"
        self.default_op: tuple[self.T, Source] = self.ops.get(self.default_operation)
        self.manager_active_tasks: dict[str, asyncio.Task] = dict()

    async def connect(
        self, websocket: WebSocket,
        profile: Profile,
        # op_data: dict, TODO: add op_data
    ):
        await websocket.accept()

        op_data: ReadClientOp = self.default_op[0]()
        op_data: dict = op_data.model_dump()
        log.debug("websocket connected with op_data %s", op_data)

        # TODO: Manage multi-connection (if the new op has been received for the reader
        # and the reader is already processed for other Websocket connections
        # the task for each connection should be recreated.)
        if op_data.get("op") and op_data["op"] in self.ops:
            if not self.active_connections.get(profile.profile_seq):
                self.active_connections[profile.profile_seq] = dict()
                self.active_connections[profile.profile_seq]["websockets"] = list()
                log.info("New profile connected to websocket %s", websocket)
                with get_session() as session:
                    if not op_data.get("reader_id"):
                        readers = select_profile_readers(session, profile.profile_seq)
                    else:
                        reader_seq = reader_id_to_seq(op_data['reader_id'])
                        reader = await self.get_reader_model(session, reader_seq, profile.profile_seq)
                        readers = [reader]

                if op_data.get("reader_id"):
                    del op_data['reader_id']

                log.info("websocket connected to readers %s", readers)
                if readers is None:
                    await websocket.send_json({'error': 'There are no readers'})
                for reader in readers:
                    await self.add_reader_to_profile(reader, profile, op_data)

            self.active_connections[profile.profile_seq]["websockets"].append(websocket)

            await self.add_all_tasks_for_new_websocket(
                profile_seq=profile.profile_seq, websocket=websocket
            )
        else:
            if not op_data.get("op"):
                error_message = "No 'op' included in client message"
                log.exception(error_message)
                await websocket.send_json({'error': error_message})
            else:
                error_message = "Invalid 'op' included in client message"
                log.exception(error_message)
                await websocket.send_json({'error': error_message})
        await self.websocket_handler(websocket, profile)

    async def add_all_tasks_for_new_websocket(self, profile_seq: str, websocket: WebSocket):

        try:
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

                    send_task = asyncio.create_task(
                        self.send_updates_periodically(
                            processor, websocket, data, reader, source
                        )
                    )
                    task_name = f"TASK-{websocket}-{reader}-{processor}"
                    send_task.set_name(task_name)
                    connection_reader["reader_task_names"].append(task_name)
                    self.manager_active_tasks[task_name] = send_task

                    log.debug("periodically task created for reader %s", reader_id)
        except ApiWebsocketError as ex:
            log.exception("Error while the creating the task for new websocket", exc_info=ex)

    async def get_reader_model(self, session, reader_seq, profile_seq):
        reader = select_reader(session, reader_seq, profile_seq)
        return reader

    async def add_reader_to_profile(
        self, reader: Reader, profile, op_data: dict
    ):
        params = reader_to_source_params(profile, reader)
        source = create_source(reader.source, params)

        if not self.active_connections[profile.profile_seq].get(
            reader.reader_seq
        ):
            self.active_connections[profile.profile_seq][reader.reader_seq] = dict()

        connection_reader = self.active_connections[profile.profile_seq][
            reader.reader_seq
        ]

        model_type, processor = self.ops[op_data["op"]]
        data = model_type(json=op_data)

        connection_reader["reader"] = reader
        connection_reader["source"] = source
        connection_reader["source_data"] = data
        connection_reader["processor"] = processor
        connection_reader["reader_task_names"] = list()
        log.debug("Added reader %s to profile %s", reader.reader_seq, profile.profile_seq)


    async def disconnect(self, websocket: WebSocket, profile):
        await websocket.close()
        # TODO: Close all task for a websocket connection
        self.active_connections[profile.profile_seq]["websockets"].remove(websocket)
        if not self.active_connections[profile.profile_seq]["websockets"]:
            del self.active_connections[profile.profile_seq]

    async def websocket_handler(self, websocket: WebSocket, profile: Profile):
        """
        Handler loop for web sockets
        """
        while True:
            await self.process_message(websocket, profile)

    async def send_updates_periodically(
        self,
        processor: Callable,
        websocket: WebSocket,
        source_data: ReadClientOp,
        reader: Reader,
        source: Source,
        interval: float = .5,
    ):
        """
        Continuously sends updates to the client at regular intervals.
        This task runs concurrently with the message receiving loop.
        """
        log.debug("Initiated send_updates_periodically() for reader with sequence: %s", reader.reader_seq)
        if not interval and not isinstance(interval, float):
            interval = None
        try:
            while True:
                source_data: ReadClientOp = await processor(websocket, source_data, source)

                if interval:
                    await asyncio.sleep(interval)
        except ApiWebsocketError as ex:
            log.exception("The sending the updates periodically catch unrecognized error", exc_info=ex)
            await websocket.send_json({'error': "Periodic update transmission unexpectedly terminated."})
        finally:
            task_name = f"TASK-{websocket}-{reader}-{processor}"
            self.cancel_and_delete_manager_task(task_name)


    def cancel_and_delete_manager_task(self, task_name: str):
        task = self.manager_active_tasks.get(task_name)
        if task:
            task.cancel()
            del self.manager_active_tasks[task_name]


    async def process_message(self, websocket: WebSocket, profile: Profile):
        """
        Process all messages for one Websocket.
        It should be run in a separate thread, because of the blocking operation "websocket.receive_text()".
        Once the message is taken, it changes source for the reader.
        """
        try:
            text = await websocket.receive_text()
            msg = json.loads(text)
            for param in ['op', 'reader_id']:
                if param not in msg:
                    await websocket.send_json(
                        {'error': f"No '{param}' included in client message"}
                    )
                    return

            if msg['op'] not in self.ops:
                await websocket.send_json({'error': "Invalid 'op' included in client message"})
                return

            op_name = msg['op']
            if op_name not in self.ops:
                await websocket.send_json({'error': f"Unknown op {op_name}"})
                return
            reader_seq = reader_id_to_seq(msg['reader_id'])

            if not self.active_connections.get(profile.profile_seq).get(reader_seq):
                with get_session() as session:
                    reader = await self.get_reader_model(session, reader_seq, profile.profile_seq)

            reader = self.active_connections[profile.profile_seq][reader_seq]["reader"]
            del msg['reader_id']
            await self.add_reader_to_profile(reader, profile, msg)
            await self.change_reader_processor(profile.profile_seq, reader)

        except JSONDecodeError as ex:
            error_message = f"Json decode error for reader {reader_seq}"
            log.exception(error_message, exc_info=ex)
            await websocket.send_json({'error': error_message})

    async def change_reader_processor(
        self,
        profile_seq: str,
        reader: Reader,
    ):
        """
        Deletes previous periodic tasks and creates new ones with a new processor.
        """

        connection_reader = self.active_connections[profile_seq][reader.reader_seq]
        reader: Reader = connection_reader["reader"]
        source = connection_reader["source"]
        data = connection_reader["source_data"]
        processor = connection_reader["processor"]
        reader_task_names = connection_reader["reader_task_names"]
        for task_name in reader_task_names:
            self.cancel_and_delete_manager_task(task_name)

        new_tasks = []
        for websocket in self.active_connections[profile_seq]["websockets"]:
            send_task = asyncio.create_task(
                self.send_updates_periodically(
                    processor, websocket, data, reader, source
                )
            )
            task_name = f"TASK-{websocket}-{reader}-{processor}"
            send_task.set_name(task_name)
            new_tasks.append(task_name)
            self.manager_active_tasks[task_name] = send_task
        connection_reader["reader_task_names"] = new_tasks

    async def process_read(
        self,
        websocket: WebSocket,
        op: ReadClientOp,
        source: Source,
    ):
        """
        Responds with the received data.
        """
        boundary = Boundary(position=op.position, direction=op.direction)
        stream_items: list[StreamItem] = source(boundary)

        if len(stream_items) > 0 and stream_items[-1].index:

            await websocket.send_json(
                [item.model_dump_json() for item in stream_items]
            )
            log.debug("Source output stream_items %s", [item.model_dump_json() for item in stream_items])
            op.position = stream_items[-1].index
        return op
