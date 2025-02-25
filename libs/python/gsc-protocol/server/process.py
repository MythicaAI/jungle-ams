from typing import Any, Awaitable, Callable, Iterator

from encoder_cbor import ATTRIBUTE, BEGIN, END, FILE, FLOW, HELLO, LOG, PING_PONG
from net_buffer import FrameHeader
from server.client import Client
from files import FileRef, Cache

server_ver_string = "1.0.0"



def process_generate(client: Client, payload: dict) -> Iterator[bytes]:
    encoder = client.encoder
    name = payload.get('process')
    if not name:
        yield from encoder.error("missing process name")
        return
    gen = c.processors.get(name)
    if gen is None:
        yield from encoder.error(f"no process matching {name}")
        return

    c.depth = c.depth + 1
    process_context = ProcessContext(base_path=c.base_path, depth=c.depth)
    client.stack.append(process_context)


def process_generate_end(client: Client, payload: dict) -> Iterator[bytes]:
    """Process a END frame

    After a BEGIN ATTRIB/FILE . END the processor stack can be evaluated - it
    may be that some fetches are still in process from the block. Allow
    the stream context to finish all fetches that were part of the context before
    begninng the processor.
    """
    g = c.stack[-1]
    g.depth = 0
    g.tasks = []
    g.files.clear()
    g.args = payload.get('args', {})
    g.tasks.append(asyncio.create_task(g.fn(g)))
    c.stack.pop()
    c.depth = c.depth - 1
    assert c.depth >= 0
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

def process_ping_pong(client: Client, payload: Any) -> Iterator[bytes]
    yield from client.encoder.ping_pong()

def process_begin(client: Client, payload: Any) -> Iterator[bytes]:
    """Process a BEGIN frame"""
    if type(payload) != dict:
        print("process_generate: from client:", payload)

    client.server.automations = {
        'foo': gen_foo,
        'bar': gen_bar,
    }

    if 'generate' in payload:
        yield from process_generate(c.stream_context, payload)

def process_attr(client: Client, payload: Any) -> Iterator[bytes]:
    yield from client.encoder.info(payload)

def process_end(client: Client, payload: Any) -> Iterator[bytes]:
    if not client.stack:
        yield from client.encoder.error("no generator running")
    else:
        yield from process_generate_end(server, client, payload)

def process_log(client: Client, payload: Any) -> Iterator[bytes]:
    print(payload)
    yield from client.encoder.info(payload)


async def process_flow(client: Client, payload: Any) -> Iterator[bytes]:
    pass


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
