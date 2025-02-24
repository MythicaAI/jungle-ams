from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Iterable

import pytest
from decoder_combiner import StreamContext
from encode_attributes import encode_attr_transform
from encoder_cbor import encode_attribute, encode_begin, encode_end, encode_file, encode_hello, encode_ping_pong
from files import FileRef
from hexdump import hexdump
from net_buffer import NetBuffer
from processor import ProcessContext
from server import process_frames


@pytest.fixture
def temp_dir():
    with TemporaryDirectory() as temp_dir:
        yield temp_dir


def test_server_frames(temp_dir):
    c = StreamContext(base_path=Path(temp_dir))
    buffer = NetBuffer()
    buffer.append_with(encode_hello('test_server_frames'))
    buffer.append_with(encode_ping_pong())
    buffer.append_with(encode_begin("test", "test", 0))
    buffer.append_with(encode_end(0))
    frame_iterator = buffer.read_frames()
    for frame in process_frames(c, frame_iterator):
        hexdump(frame)


def generate_auth_token():
    import secrets
    return secrets.token_urlsafe(16)


def test_server_processing(temp_dir):
    """Test server receiving a processing request """
    from euclid import Matrix4

    m = Matrix4.new_identity()
    origin = m[0:16]

    client_info = {
        'client': 'test_server_processing',
        'auth_token': generate_auth_token()
    }
    from trimesh import load
    self_path = Path(__file__).parent
    model_path = self_path / '..' / 'test_dir/sub_dir/SM_room_explore_01_a.gltf'
    with open(model_path, 'rb') as f:
        mesh = load(f, file_type='gltf')

    def encode_generate_response(c: ProcessContext) -> Iterable[bytes]:
        yield from encode_begin("result", "/generate/mesh", 0)
        yield from encode_attr_transform("origin", origin)
        yield from encode_begin("mesh_0", "/mesh", 1)
        yield from encode_attribute('vertices', "Tri3f", mesh.vertices)
        yield from encode_end(c.depth)
        yield from encode_end(0)

    async def generate_mesh(c):
        c.o.append_with(encode_generate_response(c))

    c = StreamContext(base_path=Path(temp_dir))

    c.register_processor(
        "generate/mesh", generate_mesh)

    def process_client_frames():
        buffer = NetBuffer()
        buffer.append_with(encode_hello(**client_info))
        buffer.append_with(encode_begin("process", "/generate/mesh", 0))
        buffer.append_with(encode_file(
            file_ref=FileRef(
                relative_path=Path('test_dir/sub_dir/SM_room_explore_01_a.usd'))))
        buffer.append_with(encode_end(0))
        for frame in process_frames(c, buffer.read_frames()):
            hexdump(frame)

    process_client_frames()
