from pathlib import Path
from tempfile import TemporaryDirectory

from encoder_cbor import encode_begin, encode_end, encode_hello, encode_ping_pong
from hexdump import hexdump
from net_buffer import NetBuffer
from server import StreamContext, process_frames


def test_server_frames():
    with TemporaryDirectory() as temp_dir:
        c = StreamContext(base_path=Path(temp_dir))
        buffer = NetBuffer()
        buffer.append_with(encode_hello('test_server_frames'))
        buffer.append_with(encode_ping_pong())
        buffer.append_with(encode_begin("test", "test", 0))
        buffer.append_with(encode_end(0))
        frame_iterator = buffer.read_frames()
        for frame in process_frames(c, frame_iterator):
            hexdump(frame)
