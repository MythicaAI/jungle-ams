from pathlib import Path

from decoder_combiner import StreamContext, read_frames
from encoder_cbor import ATTRIBUTE, BEGIN, END, Encoder, HELLO
from net_buffer import NetBuffer


def test_decoder_combiner():
    e = Encoder(max_payload=3)
    b = NetBuffer()
    b.append_with(e.hello("world", "auth"))
    b.append_with(e.begin("test", "oversize", 0))
    b.append_with(e.attr("foo", "bar", "xxxxxxxxxxx"))
    b.append_with(e.end(0))

    frame_types = [
        HELLO,
        BEGIN,
        ATTRIBUTE,
        END
    ]
    c = StreamContext(Path("./fake_base_path"))
    for header, payload in read_frames(c, b.read_frames()):
        assert not header.partial
        assert type(payload) is not bytes
        assert header.frame_type == frame_types[0]
        frame_types.pop(0)
