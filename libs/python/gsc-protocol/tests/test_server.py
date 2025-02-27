from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any, Iterable, cast

import pytest
from decoder_combiner import StreamContext, read_frames
from encoder_cbor import Encoder
from euclid import Matrix4
from files import Cache, FileRef
from hexdump import hexdump
from net_buffer import NetBuffer
from server.automation import ProcessContext
from server.client import Client
from server.process import process_frames
from server.server import Server
from trimesh import Geometry, PointCloud, Trimesh, load


@pytest.fixture
def temp_dir():
    with TemporaryDirectory() as temp_dir:
        yield temp_dir


@pytest.fixture
def encoder():
    return Encoder()


def test_server_frames(encoder, temp_dir):
    files = Cache(base_path=Path(temp_dir))
    did_begin = False

    def on_begin_test(client: Client, payload: Any) -> ProcessContext:
        nonlocal did_begin
        assert payload == "test"
        return ProcessContext(files)

    files = Cache(base_path=Path(temp_dir))
    server = Server(on_begin={'test': on_begin_test}, files=files)

    buffer = NetBuffer()
    buffer.append_with(encoder.hello('test_server_frames'))
    buffer.append_with(encoder.ping_pong())
    buffer.append_with(encoder.begin("test", "test", 0))
    buffer.append_with(encoder.end(0))

    stream = StreamContext()
    full_frame_iterator = read_frames(stream, buffer.read_frames())

    client = Client(server)
    for frame in process_frames(client, full_frame_iterator):
        hexdump(frame)
    assert did_begin


def generate_auth_token():
    import secrets
    return secrets.token_urlsafe(16)


def to_verts(geo: Geometry):
    if isinstance(geo, Trimesh):
        return cast(Trimesh, geo).vertices
    elif isinstance(geo, PointCloud):
        return cast(PointCloud, geo).vertices


def test_server_processing(encoder, temp_dir):
    """Test server receiving a processing request """
    m = Matrix4.new_identity()
    origin = m[0:16]

    client_info = {
        'client': 'test_server_processing',
        'auth_token': generate_auth_token()
    }
    self_path = Path(__file__).parent
    model_path = self_path / '..' / 'test_dir/sub_dir/SM_room_explore_01_a.gltf'
    with open(model_path, 'rb') as f:
        mesh = load(f, file_type='gltf')

    def encode_generate_response() -> Iterable[bytes]:
        yield from encoder.begin("automation", "/generate/mesh", 0)
        yield from encoder.attr("origin", "Matrix4d", origin)
        yield from encoder.begin("mesh_0", "/mesh", 1)
        yield from encoder.attr('vertices', "Vert3f", to_verts(mesh))
        yield from encoder.end(1)
        yield from encoder.end(0)

    def generate_mesh(client: Client, payload: Any) -> ProcessContext:
        yield from encode_generate_response()
        return ProcessContext(client.server.files)

    server = Server(on_begin={'/automation/generate_mesh': generate_mesh})
    client = Client(server)

    def process_client_frames(client: Client):
        buffer = NetBuffer()
        buffer.append_with(encoder.hello(**client_info))
        buffer.append_with(encoder.begin("automation", "/generate/mesh", 0))
        buffer.append_with(encoder.file(
            file_ref=FileRef(
                relative_path=Path('test_dir/sub_dir/SM_room_explore_01_a.usd'))))
        buffer.append_with(encoder.end(0))
        for frame in process_frames(client, buffer.read_frames()):
            hexdump(frame)

    process_client_frames(client)
