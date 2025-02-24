from pathlib import Path
from typing import Any, Iterator

import cbor2

from encoder_cbor import PARTIAL
from net_buffer import FrameHeader


class StreamContext:
    def __init__(self, base_path: Path):
        self.stream_id = 0
        self.seq = 0
        self.streams: dict[int, list[tuple[int, bytes]]] = {}
        self.base_path = base_path
        self.depth = 0


def read_frames(
        c: StreamContext,
        partial_frame_reader: Iterator[tuple[FrameHeader, Any]]) -> Iterator[tuple[FrameHeader, Any]]:
    """
    Given a stream context and an iterator that produces partial frames
    generate a stream of reassembled frames output responses
    """

    def add_stream_partial(partial_payload: bytes):
        """Add a stream partial using the last sequence partial of the client context"""
        c.streams.setdefault(c.stream_id, []).append((c.seq, partial_payload))

    def collapse_stream() -> bytearray:
        """Collapse a stream of partials into a single byte array"""
        buffer = bytearray()
        last_seq = 0
        partials = c.streams.get(c.stream_id, [])
        for seq, payload in partials:
            if seq == 0:
                last_seq = 0
            else:
                assert c.seq == last_seq + 1
                last_seq = c.seq
            buffer.extend(payload)
        del c.streams[c.stream_id]
        c.stream_id = 0
        c.seq = 0
        return buffer

    # process available frames, yielding data to send
    for header, payload in partial_frame_reader:
        print(header.frame_type, header.payload_length, header.flags, payload)
        frame_type = header.frame_type

        # consume the partial frames but don't yield them
        if frame_type == PARTIAL:
            assert not header.partial
            c.stream_id = int(payload['id'])
            c.seq = int(payload['seq'])
            continue

        # handle the partial frames in the stream by adding the partial frame
        # and eventually parsing it as a single buffer
        if header.partial:
            if c.seq > 0:
                assert type(payload) is bytes
                add_stream_partial(payload)
                print(f"received partial payload: {len(payload)} bytes")
                continue
            else:
                yield header, cbor2.loads(memoryview(collapse_stream()))
