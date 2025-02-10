async def connect(
        self,
        websocket: WebSocket,
        profile: Profile,
        op_data: Optional[dict] = None,
):
    # there is no loop while async testing (Python 3.10), it should be set up on connect
    if not self.loop:
        self.loop = asyncio.get_event_loop()
    await websocket.accept()

    if not op_data:
        op_data: ReadClientOp = self.default_op[0]()
        op_data: dict = op_data.model_dump()
    log.debug("websocket connected with op_data %s", op_data)

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
                    reader = await self.get_reader_model(
                        session, reader_seq, profile.profile_seq
                    )
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
