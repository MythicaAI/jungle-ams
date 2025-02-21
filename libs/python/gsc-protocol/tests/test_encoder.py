from pathlib import Path

import pytest
from encoder_cbor import *
from files import FileRef


def test_basic_frame_encoding():
    """Test basic frame encoding with simple payload."""
    frame = encode_frames(BEGIN, ["test"])

    # Check frame structure
    assert frame[0] == BEGIN
    payload_len = struct.unpack("<H", frame[1:3])[0]
    assert payload_len > 0

    # Decode payload
    payload = cbor2.loads(frame[3:])
    assert payload == ["test"]


def test_oversized_payload():
    """Test rejection of oversized payloads."""
    large_data = "x" * (MAX_PAYLOAD_SIZE + 1000)
    with pytest.raises(ValueError, match="exceeds maximum"):
        encode_frames("B", large_data)


def test_matrix4d_encoding():
    """Test matrix encoding and validation."""
    matrix = [float(i) for i in range(16)]
    encoded = encode_matrix4d(matrix)
    assert isinstance(encoded, cbor2.CBORTag)
    assert encoded.tag == 2

    # Should fail with wrong size
    with pytest.raises(ValueError):
        encode_matrix4d([1.0, 2.0, 3.0])  # Too few elements


def test_begin_frame():
    """Test BEGIN frame structure."""
    frame = encode_begin("Layer", "test_layer", 2)
    assert frame[0] == BEGIN

    payload = cbor2.loads(frame[3:])
    assert payload == [1, 2, "Layer", "test_layer"]


def test_attribute_frame():
    """Test attribute frame structure."""
    frame = encode_attribute("color", "vec3", [1.0, 0.0, 0.0])
    assert frame[0] == ATTRIBUTE

    payload = cbor2.loads(frame[3:])
    assert payload["name"] == "color"
    assert payload["type"] == "vec3"
    assert payload["value"] == [1.0, 0.0, 0.0]


def test_transform_frame():
    """Test transform frame encoding."""
    matrix = [float(i) for i in range(16)]
    frame = encode_transform("xform1", matrix)
    assert frame[0] == ATTRIBUTE

    payload = cbor2.loads(frame[3:])
    assert payload["name"] == "xform1"
    assert payload["type"] == "Matrix4d"
    assert isinstance(payload["value"], cbor2.CBORTag)
    assert payload["value"].tag == 2


def test_ping_pong_frame():
    """Test ping-pong frame structure."""
    frame = encode_ping_pong()
    assert frame[0] == PING_PONG

    payload = cbor2.loads(frame[3:])
    assert "time_ms" in payload
    assert isinstance(payload["time_ms"], (int, float))


def test_file_param_frame():
    """Test file parameter frame structure."""
    file_ref = FileRef(
        size=0,
        relative_path=Path("test.txt"),
        content_hash="abc123")
    frame = encode_file_param(file_ref)
    assert frame[0] == FILE_PARAM

    payload = cbor2.loads(frame[3:])
    assert FileRef(**payload) == file_ref


def test_hello_frame():
    """Test hello frame structure."""
    frame = encode_hello('test')
    assert frame[0] == HELLO

    payload = cbor2.loads(frame[3:])
    assert payload["ver"] == 0
    assert isinstance(payload["client"], str)
