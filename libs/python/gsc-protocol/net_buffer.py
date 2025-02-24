import struct
from typing import Any, Awaitable, Callable, Iterator, Optional, Type

import cbor2
from cbor2 import CBORDecodeError

FlushWebSocketCallback = Callable[[Type["memoryview"]], Awaitable[None]]


class FrameHeader:
    """Represents a validated frame header"""

    def __init__(self, frame_type: int, flags: int, payload_length: int):
        self.frame_type = frame_type  # ASCII character code
        self.flags = flags
        self.payload_length = payload_length

    @property
    def partial(self):
        return self.flags & 1 == 1

    @property
    def total_length(self) -> int:
        """Total frame length including header"""
        return self.payload_length + 4  # 1 byte type + 1 byte flags + 2 bytes length

    def __repr__(self):
        return f"FrameHeader(type={chr(self.frame_type)}, length={self.payload_length})"


class NetBuffer:
    """Efficiently accumulates bytes from a WebSocket stream
    and extracts complete CBOR frames with security validations."""

    MAX_PAYLOAD_SIZE = 64 * 1024  # 64KB max payload size
    HEADER_SIZE = 4  # 1 byte type + 1 byte flags + 2 bytes length
    FLAG_PARTIAL = 1

    def __init__(self):

        # the current buffer that is being appended to, this is then
        # turned into a memoryview for the purposes of reading frames
        self.buffer = bytearray()

        # partial byte arrays that are fully formed frames but only a partial message
        # for some partial messages produce the data as a stream
        self.partials: list[bytes] = []

    def append_with(self, it: Iterator[bytes]):
        """Appends buffer data with an iterator."""
        for b in it:
            self.buffer.extend(b)

    def append_bytes(self, new_data: bytes):
        """Appends new WebSocket data to the buffer efficiently."""
        self.buffer.extend(new_data)

    def _maybe_frame_header(self, data: memoryview) -> Optional[FrameHeader]:
        """Tries to decode a header from the memory view if one can be extracted"""
        if len(data) < self.HEADER_SIZE:
            return None
        header = bytes(data[0:4])
        try:
            frame_type, flags, payload_length = struct.unpack("<BBH", header)
        except struct.error as e:
            raise ValueError(f"failed to unpack frame header 0x{header.hex()}") from e

        # Validate frame type (must be ASCII letter)
        if not (65 <= frame_type <= 90):  # A-Z
            raise ValueError(f"Invalid frame type: {frame_type}")

        # Validate payload length
        if payload_length > self.MAX_PAYLOAD_SIZE:
            raise ValueError(f"Payload length {payload_length} exceeds maximum allowed size")

        return FrameHeader(frame_type, flags, payload_length)

    def _maybe_frame_payload(
            self,
            data: memoryview,
            header: FrameHeader) -> Optional[Any]:
        """Safely decode frame payload after header validation.

        Args:
            data: memoryview of buffer starting after header
            header: Validated frame header

        Returns:
            Optional[Any]: Decoded payload or None if incomplete

        Raises:
            CBORDecodeError: If payload is invalid CBOR
        """
        if len(data) < header.payload_length:
            return None

        # Extract exact payload bytes
        payload_data = bytes(data[:header.payload_length])

        try:
            # Decode payload with CBOR
            return cbor2.loads(payload_data)
        except (CBORDecodeError, EOFError) as e:
            raise CBORDecodeError(f"Invalid payload for frame type {chr(header.frame_type)}: {e}")

    async def flush(self, fn: FlushWebSocketCallback):
        try:
            await fn(memoryview(self.buffer))
        finally:
            self.buffer.clear()

    def read_frames(self) -> Iterator[tuple[FrameHeader, Any]]:
        """Extracts complete frames with header validation."""
        view = memoryview(self.buffer)
        offset = 0

        while offset < len(view):
            try:
                # First decode and validate header
                header = self._maybe_frame_header(view[offset:])
                if not header:
                    break  # Incomplete header, wait for more data

                # Payload is partially available
                if header.flags & self.FLAG_PARTIAL == 1:
                    start = offset + self.HEADER_SIZE
                    end = start + header.payload_length
                    partial_payload = bytes(view[start:end])
                    yield header, partial_payload
                else:
                    # payload should eventually be available in the stream
                    payload = self._maybe_frame_payload(
                        view[offset + self.HEADER_SIZE:],
                        header)
                    if payload is None:
                        break
                    yield header, payload

                # Move offset past complete frame
                offset += header.total_length

            except (ValueError, CBORDecodeError) as e:
                # Clear buffer on protocol errors
                self.buffer = bytearray()
                raise

        # Keep unprocessed bytes
        if offset:
            self.buffer = self.buffer[offset:]
