from typing import Any, Iterator

import cbor2

from bytestream_iterator import ByteStreamIterator
from encoder_cbor import PARTIAL
from net_buffer import FLAG_PARTIAL, FrameHeader


class StreamContext:
    """Stateful stream context, provides enough context to reconstruct partials and
    de-mux streams of content"""

    def __init__(self):
        self.stream_id = 0
        self.seq = 0
        self.streams: dict[int, list[tuple[int, bytes]]] = {}
        self.depth = 0


def read_frames(
        c: StreamContext,
        partial_frame_reader: Iterator[tuple[FrameHeader, Any]]) -> Iterator[tuple[FrameHeader, Any]]:
    """
    Given a stream context and an iterator that produces partial frames
    generate a stream of re-assembled frames as output
    """

    def add_stream_partial(partial_payload: bytes):
        """
        Add a stream partial using the last sequence partial of the client context
        """
        c.streams.setdefault(c.stream_id, []).append((c.seq, partial_payload))

    def collapse_stream() -> Iterator[bytes]:
        """
        Collapse a stream of partials into a single byte iterator, this happens
        after the sentinel sequence of 0 is observed. The collapse yields bytes
        per sequence which is fed into a stream iterator over the returned bytes
        to feed it into the CBOR2 decoder.
        """
        partials = c.streams.get(c.stream_id, [])
        last_seq = 0
        for seq, payload in partials:
            if seq == 0:
                last_seq = 0
            else:
                assert seq == last_seq + 1
                last_seq = seq
            yield payload
        assert last_seq == 0

        # reset the stream tracking state
        del c.streams[c.stream_id]
        c.stream_id = 0
        c.seq = 0

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
                add_stream_partial(payload)
                stream = ByteStreamIterator(collapse_stream())
                header.flags &= ~FLAG_PARTIAL
                yield header, cbor2.load(stream)
        else:
            # payload is already parsed
            yield header, payload
