from pathlib import Path

import pytest
from encoder_cbor import *
from files import FileRef
from net_buffer import FrameHeader, NetBuffer


@pytest.fixture
def encoder():
    return Encoder()


def assert_one(it: Iterator[bytes]) -> list[tuple[FrameHeader, Any]]:
    frames = assert_some(it)
    assert len(frames) == 1
    return frames


def assert_some(it: Iterator[bytes]) -> list[tuple[FrameHeader, Any]]:
    buffer = NetBuffer()
    buffer.append_with(it)

    frames = []
    for frame in buffer.read_frames():
        frames.append(frame)
        header, payload = frame
        assert len(payload) > 0
        assert type(payload) in {bytes, list, dict}
    assert len(frames) > 0, "no frames generator"
    return frames


def test_basic_frame_encoding(encoder: Encoder):
    """Test basic frame encoding with simple payload."""
    header, payload = assert_one(encoder.frames(BEGIN, ["test"]))[0]

    # Check frame structure and decoded payload
    assert header.frame_type == BEGIN
    assert header.payload_length > 0
    assert not header.partial
    assert payload == ["test"]


def test_oversized_payload(encoder: Encoder):
    """Test encoding of oversize payloads."""
    large_data = "x" * (MAX_PAYLOAD_SIZE + 1000)
    frames = assert_some(encoder.begin('str', 'data', large_data))
    assert len(frames) >= 2
    partials = []
    begins = []
    last_seq = 0
    for header, payload in frames:
        if header.frame_type == BEGIN:
            begins.append(header)
            assert header.partial

        # PARTIAL frame type should always be intact
        # TODO: this is a problem for max_payload < len(encoded(PARTIAL))
        # TODO: maybe_frame_header is not respecting the encoders max_payload
        if header.frame_type == PARTIAL:
            assert not header.partial, "partials should be intact"
            partials.append(header)
            if last_seq == 0:
                assert payload['seq'] == 1, "partials start with seq 1"
            else:
                assert payload['seq'] == 0, "partials end with seq 0"
            last_seq = int(payload['seq'])
            assert int(payload['id']) != 0

    assert len(partials) == 2
    assert len(begins) == 2


def test_begin_frame(encoder: Encoder):
    """Test BEGIN frame structure."""
    depth = 2
    header, payload = assert_one(encoder.begin("Layer", "test_layer", depth))[0]
    assert header.frame_type == BEGIN
    assert payload == [depth, "Layer", "test_layer"]


def test_attribute_frame(encoder: Encoder):
    """Test attribute frame structure."""
    header, payload = assert_one(encoder.attr("color", "vec3", [1.0, 0.0, 0.0]))[0]
    assert header.frame_type == ATTRIBUTE

    assert payload["name"] == "color"
    assert payload["type"] == "vec3"
    assert payload["value"] == [1.0, 0.0, 0.0]


def test_ping_pong_frame(encoder: Encoder):
    """Test ping-pong frame structure."""
    header, payload = assert_one(encoder.ping_pong())[0]
    assert header.frame_type == PING_PONG
    assert "time_ms" in payload
    assert isinstance(payload["time_ms"], (int, float))


def test_file_param_frame(encoder: Encoder):
    """Test file parameter frame structure."""
    file_ref = FileRef(
        size=0,
        relative_path=Path("test.txt"),
        content_hash="abc123")
    header, payload = assert_one(encoder.file(file_ref))[0]
    assert header.frame_type == FILE
    assert FileRef(**payload) == file_ref


def test_hello_frame(encoder: Encoder):
    """Test hello frame structure."""
    header, payload = assert_one(encoder.hello('test'))[0]
    assert header.frame_type == HELLO
    assert payload["ver"] == 0
    assert isinstance(payload["client"], str)
