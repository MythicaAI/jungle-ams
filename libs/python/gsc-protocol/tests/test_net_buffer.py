import struct
from typing import Any

import cbor2
import pytest
from encoder_cbor import BEGIN, PARTIAL, encode_frames
from hexdump import hexdump
from net_buffer import NetBuffer


@pytest.fixture
def buffer():
    """Provides a fresh NetBuffer instance for each test."""
    return NetBuffer()


def create_frame(type_char: str, payload: Any) -> bytes:
    """Helper to create a valid frame with correct format.

    Args:
        type_char: Single character frame type (A-Z)
        payload: Python object to encode as CBOR payload

    Returns:
        bytes: Complete frame with header and CBOR-encoded payload
    """
    payload_bytes = cbor2.dumps(payload)
    return bytes([ord(type_char)]) + struct.pack("<H", len(payload_bytes)) + payload_bytes


class TestFrameFormat:
    def test_large_valid_frame(self, buffer):
        """Test handling of large but valid frame."""
        # Create payload just under 64KB
        large_data = {"data": "x" * 60000}
        frame_data = create_frame("B", large_data)
        buffer.append_bytes(frame_data)

        frames = list(buffer.read_frames())
        assert len(frames) == 1
        frame_type, length, payload = frames[0]
        assert frame_type == ord("B")
        assert payload == large_data

    def test_oversized_frame(self, buffer):
        """Test rejection of frame exceeding 64KB."""
        # Create payload over 64KB
        too_large = {"data": "x" * 65000}
        frame_data = create_frame("B", too_large)
        buffer.append_bytes(frame_data)

        with pytest.raises(ValueError, match="exceeds maximum allowed size"):
            list(buffer.read_frames())

    def test_partial_length_field(self, buffer):
        """Test handling of partial length field."""
        # Just type and 1 byte of length
        buffer.append_bytes(bytes([ord("B"), 0x01]))
        assert list(buffer.read_frames()) == []
        assert len(buffer.buffer) == 2

    def test_multiple_frames(self, buffer):
        """Test processing multiple frames of different sizes."""
        frames = [
            ("B", {"small": "data"}),
            ("S", {"medium": "x" * 1000}),
            ("E", {"larger": "x" * 5000})
        ]

        # Concatenate all frames
        buffer_data = b"".join(create_frame(t, p) for t, p in frames)
        buffer.append_bytes(buffer_data)

        result = list(buffer.read_frames())
        assert len(result) == 3
        for i, (type_char, payload) in enumerate(frames):
            frame_type, length, received_payload = result[i]
            assert frame_type == ord(type_char)
            assert received_payload == payload

    def test_fragmented_large_frame(self, buffer):
        """Test handling of fragmented large frame."""
        payload = {"data": "x" * 50000}
        frame_data = create_frame("B", payload)

        # Send frame in chunks
        chunk_size = 16384
        for i in range(0, len(frame_data), chunk_size):
            buffer.append_bytes(frame_data[i:i + chunk_size])
            # Intermediate reads should return empty iterator until frame is complete
            assert list(buffer.read_frames()) == []

        # Final read should return complete frame
        frames = list(buffer.read_frames())
        assert len(frames) == 1
        frame_type, length, received_payload = frames[0]
        assert frame_type == ord("B")
        assert received_payload == payload


class TestErrorHandling:
    def test_invalid_frame_type(self, buffer):
        """Test rejection of invalid frame type."""
        # Use invalid frame type (not A-Z)
        invalid_frame = bytes([0x20]) + struct.pack("<H", 1) + cbor2.dumps({"test": "data"})
        buffer.append_bytes(invalid_frame)
        with pytest.raises(ValueError, match="Invalid frame type"):
            list(buffer.read_frames())

    def test_truncated_frame(self, buffer):
        """Test handling of truncated frame data."""
        payload = {"test": "data"}
        frame_data = create_frame("B", payload)
        buffer.append_bytes(frame_data[:-5])  # Remove last 5 bytes
        assert list(buffer.read_frames()) == []
        assert len(buffer.buffer) == len(frame_data) - 5

    def test_invalid_cbor_payload(self, buffer):
        """Test handling of invalid CBOR in payload."""
        # Create frame with invalid CBOR payload
        frame = bytes([ord("B")]) + struct.pack("<H", 3) + b'\xff\xff\xff'
        buffer.append_bytes(frame)
        with pytest.raises(cbor2.CBORDecodeError):
            list(buffer.read_frames())

    def test_buffer_clearing_on_error(self, buffer):
        """Test that buffer is cleared on protocol errors."""
        # Invalid frame followed by valid frame
        invalid_frame = bytes([0x20]) + struct.pack("<H", 1) + cbor2.dumps({"bad": "data"})
        valid_frame = create_frame("B", {"good": "data"})
        buffer.append_bytes(invalid_frame + valid_frame)

        # Should raise error and clear buffer
        with pytest.raises(ValueError):
            list(buffer.read_frames())
        assert len(buffer.buffer) == 0


class TestPartials:
    def test_encoded_partials(self, buffer):
        content = "XXX"
        total_frames = 0
        partials = {}
        for frame in encode_frames(BEGIN, content, max_payload=1):
            if frame is None:
                continue
            print(f"adding frame {chr(frame[0])} {len(frame)} bytes")
            hexdump(frame)
            buffer.append_bytes(frame)

        stream_id = 0
        seq = 0
        reader = buffer.read_frames()
        for header, payload in reader:
            total_frames += 1
            if header.frame_type == PARTIAL:
                stream_id = int(payload['id'])
                seq = int(payload['seq'])
            elif header.frame_type == BEGIN:
                assert stream_id != 0
                if seq == 0:
                    assert next(reader) is None

                partials.setdefault(int(payload['id']), []).append(
                    (stream_id,
                     seq,
                     header.frame_type,
                     header.flags,
                     header.payload_length,
                     payload,))
            else:
                assert False, f"{header.frame_type} not expected"

        assert total_frames == 6
        assert len(partials) == 3
