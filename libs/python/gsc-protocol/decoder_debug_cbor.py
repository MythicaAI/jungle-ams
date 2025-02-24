import struct
from datetime import datetime
from typing import Any, Iterator, List

import cbor2
from cbor2 import CBORDecoder


def decode_tagged_type(tag: cbor2.CBORTag) -> str:
    """Decodes CBOR tagged values."""
    if tag.tag == 0:  # USD Timestamp
        # In CBOR, timestamps are typically decoded automatically to datetime
        if isinstance(tag.value, datetime):
            return f"Timestamp({int(tag.value.timestamp())})"
        return f"Timestamp({tag.value})"

    elif tag.tag == 1:  # Float16 Array
        data = tag.value
        count = struct.unpack("<H", data[:2])[0]
        floats = struct.unpack(f"<{count}e", data[2:])
        return f"Float16Array{list(floats)}"

    elif tag.tag == 2:  # 4x4 Matrix
        data = tag.value
        values = struct.unpack("<16d", data)
        return f"Matrix4d({[list(values[i:i + 4]) for i in range(0, 16, 4)]})"

    return f"UnknownTag({tag.tag}, {tag.value})"


def decode_begin(frame: List[Any]):
    """Decodes a `BEGIN` frame."""
    _, _, version, depth, entity_type, name = frame
    print(f"\n{' ' * (depth * 2)}📂 BEGIN {entity_type}: {name} (v{version})")


def decode_end(frame: List[Any]):
    """Decodes an `END` frame."""
    _, version, depth = frame
    print(f"{' ' * (depth * 2)}📁 END (v{version})")


def decode_streamitem(frame: List[Any]):
    """Decodes a `STREAMITEM` frame."""
    _, _, payload = frame
    name = payload.get("name", "Unknown")
    attr_type = payload.get("type", "UnknownType")
    value = payload.get("value")

    # Handle CBOR tagged types
    if isinstance(value, cbor2.CBORTag):
        value = decode_tagged_type(value)
    # Handle native CBOR datetime
    elif isinstance(value, datetime):
        value = f"Timestamp({int(value.timestamp())})"

    print(f"{' ' * 4}🔹 {name} ({attr_type}): {value}")


tag_handlers = {}


# tag_handlers.update(decoder_array_cbor.TAG_HOOKS)


def decode_tag_hook(decoder: CBORDecoder, tag: cbor2.CBORTag):
    pass


def decode_usd_stream(encoded_frames: Iterator[bytes]):
    """Decodes a sequence of CBOR-encoded USD frames."""
    for encoded_frame in encoded_frames:
        try:
            # needs partial handling, this is too low level -
            # can process_frames pattern from the server be used
            frame = cbor2.loads(encoded_frame, tag_hook=decode_tag_hook)
            if isinstance(frame, list) and len(frame) > 0:
                frame_type = chr(frame[0])  # Convert ASCII code to character
                if frame_type == "B":
                    decode_begin(frame)
                elif frame_type == "E":
                    decode_end(frame)
                elif frame_type == "S":
                    decode_streamitem(frame)
                else:
                    print(f"⚠️ Unknown Frame: {frame}")
            else:
                print(f"⚠️ Malformed Frame: {frame}")
        except cbor2.CBORDecodeError as e:
            print(f"⚠️ CBOR Decode Error: {e}")
