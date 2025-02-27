import struct
from typing import Iterator, Sequence

from cbor2 import CBORTag

from cbor_tag_types import TagTypes


def encode_float64_array(data: Sequence[float], little_endian: bool = False) -> Iterator[CBORTag]:
    """Encode sequence of floats as CBOR float64 array."""
    fmt = "<" if little_endian else ">"
    tag = TagTypes.FLOAT64_LE if little_endian else TagTypes.FLOAT64_BE
    packed = struct.pack(f"{fmt}{len(data)}d", *data)
    yield CBORTag(tag, packed)


def encode_float32_array(data: Sequence[float], little_endian: bool = False) -> Iterator[CBORTag]:
    """Encode sequence of floats as CBOR float32 array."""
    fmt = "<" if little_endian else ">"
    tag = TagTypes.FLOAT32_LE if little_endian else TagTypes.FLOAT32_BE
    packed = struct.pack(f"{fmt}{len(data)}f", *data)
    yield CBORTag(tag, packed)


def encode_int32_array(data: Sequence[int], little_endian: bool = False) -> Iterator[CBORTag]:
    """Encode sequence of ints as CBOR int32 array."""
    fmt = "<" if little_endian else ">"
    tag = TagTypes.INT32_LE if little_endian else TagTypes.INT32_BE
    packed = struct.pack(f"{fmt}{len(data)}i", *data)
    yield CBORTag(tag, packed)


def encode_uint8_array(data: Sequence[int]) -> Iterator[CBORTag]:
    """Encode sequence of unsigned bytes."""
    packed = struct.pack(f"B" * len(data), *data)
    yield CBORTag(TagTypes.UINT8, packed)
