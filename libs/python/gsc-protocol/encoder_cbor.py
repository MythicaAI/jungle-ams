import struct
from datetime import datetime, timezone
from itertools import count
from random import randint
from typing import Any, Iterator, Optional

import cbor2

from files import FileRef

"""Encodes protocol frames with CBOR payloads."""

MAX_PAYLOAD_SIZE = (64 * 1024) - 5  # 64KB max payload size (signed 16, 4 byte header)

HELLO = ord("H")
PING_PONG = ord("P")
BEGIN = ord("B")
END = ord("E")
LOG = ord("L")
ATTRIBUTE = ord("S")
TRANSFORM = ord("T")
FILE = ord("F")
PARTIAL = ord('Z')
FLOW = ord('X')

_next_stream_id = count(start=1)


def encode_frames(
        frame_type: int,
        payload: Any,
        stream_id_iter=_next_stream_id,
        max_payload=MAX_PAYLOAD_SIZE) -> Iterator[bytes]:
    """Yield 1 or more byte array frames resulting in constructing the requested frame and payload"""
    payload_bytes = cbor2.dumps(payload)
    payload_len = len(payload_bytes)
    sent_bytes = 0
    stream_id = 0
    seq = 0

    # if the payload has to be broken up prepare the streaming
    # state of the partial frames
    if payload_len > max_payload:
        partial = 1
        stream_id = next(stream_id_iter)
    else:
        partial = 0

    while sent_bytes < payload_len:
        chunk_len = min(max_payload, payload_len - sent_bytes)

        # when sending partial payloads, the stream will use the
        # partial frame to prefix each chunk of the stream.
        #
        # multiple streams (by ID) can be interleaved over the single stream.
        #
        # sequence starts at 1 and final sequence is 0 to mark the
        # final message in the stream sequence
        if partial:
            if sent_bytes + chunk_len == payload_len:
                seq = 0
            else:
                seq += 1

            partial_frame_payload = cbor2.dumps({'id': stream_id, 'seq': seq})
            yield struct.pack("<BBH", PARTIAL, 0, len(partial_frame_payload))
            yield partial_frame_payload

        # Frame type (1 byte) + flags (1 byte) + length (2 bytes, little endian)
        yield struct.pack("<BBH", frame_type, partial, chunk_len)
        chunk_bytes = payload_bytes[sent_bytes:sent_bytes + chunk_len]
        assert len(chunk_bytes) == chunk_len
        assert chunk_len != 0
        yield chunk_bytes
        sent_bytes += chunk_len


def encode_begin(entity_type: str, name: str, depth: int) -> Iterator[bytes]:
    """Encodes a BEGIN frame."""
    payload = [depth, entity_type, name]  # Version is 1
    yield from encode_frames(BEGIN, payload)


def encode_end(depth: int) -> Iterator[bytes]:
    """Encodes an END frame."""
    yield from encode_frames(END, [depth])  # Version is 1


def encode_attribute(name: str, attr_type: str, value: Any) -> Iterator[bytes]:
    """Encodes an attribute frame."""
    payload = {"name": name, "type": attr_type, "value": value}
    yield from encode_frames(ATTRIBUTE, payload)


def encode_ping_pong() -> Iterator[bytes]:
    """Encodes a ping-pong frame with current timestamp."""
    payload = {'time_ms': datetime.now(timezone.utc).timestamp()}
    yield from encode_frames(PING_PONG, payload)


def encode_flow_control(backoff_value: int) -> Iterator[bytes]:
    payload = {'backoff': backoff_value}
    yield from encode_frames(FLOW, payload)


def encode_error(msg: str) -> Iterator[bytes]:
    payload = {'level': 'error', 'text': msg}
    yield from encode_frames(LOG, payload)


def encode_info(msg: str) -> Iterator[bytes]:
    payload = {'level': 'info', 'text': msg}
    yield from encode_frames(LOG, payload)


def encode_warning(msg: str) -> Iterator[bytes]:
    payload = {'level': 'warning', 'text': msg}
    yield from encode_frames(LOG, payload)


def encode_file(file_ref: FileRef, status: str = False) -> Iterator[bytes]:
    """Encodes a file parameter frame."""
    payload = file_ref.model_dump(mode='json')
    payload['status'] = status
    yield from encode_frames(FILE, payload)


def encode_hello(client: str, auth_token: Optional[str] = None) -> Iterator[bytes]:
    """Encodes a hello frame with client version."""
    payload = {'ver': 0, 'client': client, 'nonce': randint(0, 2 ** 32)}
    if auth_token:
        payload['auth_token'] = auth_token
    yield from encode_frames(HELLO, payload)
