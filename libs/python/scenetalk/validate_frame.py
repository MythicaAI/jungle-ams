import msgpack

MAX_DEPTH = 10  # Prevent excessive nesting
MAX_PAYLOAD_SIZE = 2048  # Limit payload size (bytes)

VALID_FRAME_TYPES = {"B", "S", "E"}  # Allowed frame types: BEGIN, STREAMITEM, END


def validate_frame(encoded_frame: bytes, current_depth: int) -> bool:
    """Reads only the header (type + length) and validates the frame."""
    try:
        unpacked = msgpack.unpackb(encoded_frame, raw=False, use_list=True, max_bin_len=MAX_PAYLOAD_SIZE)

        if not isinstance(unpacked, list) or len(unpacked) < 2:
            print("❌ Invalid frame: Not a valid list")
            return False

        frame_type = chr(unpacked[0])  # Convert ASCII to character
        length = unpacked[1]

        if frame_type not in VALID_FRAME_TYPES:
            print(f"❌ Invalid frame type: {frame_type}")
            return False

        if not isinstance(length, int) or length < 0 or length > MAX_PAYLOAD_SIZE:
            print(f"❌ Invalid payload length: {length} (max {MAX_PAYLOAD_SIZE})")
            return False

        if frame_type == "B" and current_depth >= MAX_DEPTH:
            print(f"❌ Exceeded max depth ({MAX_DEPTH}) in BEGIN frame")
            return False

        print(f"✅ Valid Frame: Type={frame_type}, Length={length}, Depth={current_depth}")
        return True

    except msgpack.exceptions.ExtraData:
        print("❌ Extra data found in frame")
    except msgpack.exceptions.UnpackException:
        print("❌ Failed to unpack frame")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

    return False
