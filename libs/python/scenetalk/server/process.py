"""Functions used on server to process messages from the client"""
from typing import Any, Callable, Iterator

from encoder_cbor import ATTRIBUTE, BEGIN, END, FILE, FLOW, HELLO, LOG, PING_PONG
from files import FileRef
from net_buffer import FrameHeader
from server.automation import ProcessContext
from server.client import Client

server_ver_string = "1.0.0"
valid_actions = {'commit', 'rollback'}


def process_generate_end(client: Client, payload: dict) -> Iterator[bytes]:
    """Process a END frame

    After a BEGIN ATTRIB/FILE . END the processor stack can be evaluated - it
    may be that some fetches are still in process from the block. Allow
    the stream context to finish all fetches that were part of the context before
    beginning the processor.
    """
    if len(client.stack) == 0:
        yield from client.encoder.error("no context to end")
        return

    action = payload.get('action')
    if not action or action not in valid_actions:
        yield from client.encoder.error(f"end context must have action={valid_actions}")
        return

    top = client.stack[-1]
    top.depth = 0
    top.commit()

    client.stack.pop()
    yield from client.encoder.info("generator end")


def process_file(client: Client, payload: dict) -> Iterator[bytes]:
    """Process a begin fetch"""
    file_ref = FileRef(**payload)
    if not file_ref.content_hash:
        yield from client.encoder.error(f"FileRef {payload} missing content_hash")
        return
    if not file_ref.relative_path:
        yield from client.encoder.error(f"FileRef {payload} missing relative_path")
        return

    # if status == 'fetch':
    # if the file is cached locally return it
    # file_ref = c.files.by_content_hash.get(file_ref.content_hash)
    # if not file_ref:
    # yield from encode_file(file_ref, status='missing')
    # return
    # yield from encode_file(file_ref)
    # for c.files.by_relative_path[file_ref.relative_path] = file_ref
    # yield from encode_file()


def process_hello(client: Client, payload: Any) -> Iterator[bytes]:
    auth_token = payload.get('auth_token')
    if auth_token:
        client.authorize(auth_token)
    yield from client.encoder.hello(client=f'server-{server_ver_string}')


def process_ping_pong(client: Client, payload: Any) -> Iterator[bytes]:
    time_ms = payload.get('time_ms')
    client.last_time_ms = time_ms
    yield from client.encoder.ping_pong()


def process_begin(client: Client, payload: Any) -> Iterator[bytes]:
    """Process a BEGIN frame"""
    if type(payload) != dict:
        print("client:", client, "begin:", payload)
    type_name = payload.get('type')
    factory = client.server.on_begin.get(type_name)
    if factory:
        context = factory(client, payload)
        context.depth = len(client.stack)
        client.stack.append(context)
    yield bytes()


def process_attr(client: Client, payload: Any) -> Iterator[bytes]:
    if not client.stack:
        yield from client.encoder.error("no context to store attribute")
        return
    top: ProcessContext = client.stack[-1]
    attr_name = payload.get('name')
    attr_type = payload.get('type')
    attr_value = payload.get('value')
    # TODO: validate attribute type and value
    top.attributes[attr_name] = (attr_type, attr_value)
    yield bytes()


def process_end(client: Client, payload: Any) -> Iterator[bytes]:
    if not client.stack:
        yield from client.encoder.error("no active context")
    else:
        yield from process_generate_end(client, payload)


def process_log(_: Client, payload: Any) -> Iterator[bytes]:
    print(payload)
    yield bytes()


def process_flow(client: Client, payload: Any) -> Iterator[bytes]:
    # set the flow control value of the client
    if payload.get('amount'):
        flow = int(payload.get('amount', 0))
        flow = max(flow, 0)
        flow = min(flow, 100)
        # only allow the client to increase flow control
        if flow > client.flow:
            client.flow = flow
            # TODO-jrepp: add task to reduce flow
    yield from client.encoder.flow_control(client.flow, client.flow)


# Registered frame type processors
FrameProcessor = Callable[[Client, Any], Iterator[bytes]]
frame_processors: dict[int, FrameProcessor] = {
    HELLO: process_hello,
    PING_PONG: process_ping_pong,
    BEGIN: process_begin,
    END: process_end,
    LOG: process_log,
    ATTRIBUTE: process_attr,
    FILE: process_file,
    FLOW: process_flow,
}


def process_frames(
        client: Client,
        frame_reader: Iterator[tuple[FrameHeader, Any]]) -> Iterator[bytes]:
    """
    Given a stream context and an iterate that produces new header, payload tuples
    generate a stream of output responses
    """
    # process full frames, yielding data to send
    for header, payload in frame_reader:
        print(header.frame_type, header.payload_length, header.flags, payload)
        frame_type = header.frame_type
        frame_processor = frame_processors.get(frame_type)
        if not frame_processor:
            raise ValueError(f"unknown frame type {frame_type}")
        yield from frame_processor(client, payload)
