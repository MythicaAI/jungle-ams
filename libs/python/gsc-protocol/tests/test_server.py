from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any, Iterable

import pytest
from decoder_combiner import StreamContext, read_frames
from encoder_cbor import Encoder
from files import Cache, FileRef
from hexdump import hexdump
from net_buffer import NetBuffer
from processor import ProcessContext
from server import Server, process_frames


@pytest.fixture
def temp_dir():
    with TemporaryDirectory() as temp_dir:
        yield temp_dir


@pytest.fixture
def encoder():
    return Encoder()


def test_server_frames(encoder, temp_dir):
    files = Cache(
        base_path=Path(temp_dir),
        by_relative_path={},
        by_content_hash={})
    did_begin = False

    def on_begin_test(payload: Any) -> ProcessContext:
        nonlocal did_begin
        assert payload == "test"
        return ProcessContext(files)

    server = Server(on_begin={'test': on_begin_test})

    buffer = NetBuffer()
    buffer.append_with(encoder.hello('test_server_frames'))
    buffer.append_with(encoder.ping_pong())
    buffer.append_with(encoder.begin("test", "test", 0))
    buffer.append_with(encoder.end(0))

    stream = StreamContext()
    full_frame_iterator = read_frames(stream, buffer.read_frames())

    client = Client(server)
    for frame in process_frames(stream, full_frame_iterator):
        hexdump(frame)
    assert did_begin


def generate_auth_token():
    import secrets
    return secrets.token_urlsafe(16)


def test_server_processing(encoder, temp_dir):
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
        yield from encoder.begin("result", "/generate/mesh", 0)
        yield from encoder.attr("origin", "Matrix4d", origin)
        yield from encoder.begin("mesh_0", "/mesh", 1)
        yield from encoder.attr('vertices', "Tri3f", mesh.vertices)
        yield from encoder.end(c.depth)
        yield from encoder.end(0)

    async def generate_mesh(c):
        c.o.append_with(encode_generate_response(c))

    c = StreamContext(base_path=Path(temp_dir))

    c.register_processor(
        "generate/mesh", generate_mesh)

    def process_client_frames():
        buffer = NetBuffer()
        buffer.append_with(encoder.hello(**client_info))
        buffer.append_with(encoder.begin("process", "/generate/mesh", 0))
        buffer.append_with(encoder.file(
            file_ref=FileRef(
                relative_path=Path('test_dir/sub_dir/SM_room_explore_01_a.usd'))))
        buffer.append_with(encoder.end(0))
        for frame in process_frames(c, buffer.read_frames()):
            hexdump(frame)

    process_client_frames()
