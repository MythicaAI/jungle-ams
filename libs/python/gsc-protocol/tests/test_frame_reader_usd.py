import os

from decoder_debug_cbor import decode_usd_stream
# Example Usage
from frame_reader_usd import frame_reader_usd

file_path = "test_dir/sub_dir/SM_room_explore_01_a.usd"  # Replace with a valid USD file


def dump_raw_frames():
    size_on_wire = 0
    size_on_disk = os.stat(file_path).st_size
    for i, encoded_frame in enumerate(frame_reader_usd(file_path)):
        print(f"frame #{i} {len(encoded_frame)} bytes:")
        size_on_wire += len(encoded_frame)
        print(encoded_frame.hex())  # Print encoded MsgPack as hex
    print(f"disk size: {size_on_disk} wire size: {size_on_wire}")
    print(f"ratio: {(size_on_wire / size_on_disk) * 100:02f}")


def decode_debug():
    decode_usd_stream(frame_reader_usd(file_path))


decode_debug()
