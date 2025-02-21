import array
import struct
from typing import Any, Callable, Dict

from cbor2 import CBORDecoder, CBORTag

from cbor_tag_types import TagTypes


def decode_numeric_array(data: bytes, format_char: str, count: int = None) -> array.array:
    """Helper to decode binary data into array.array using struct format."""
    if count is None:
        count = len(data) // struct.calcsize(format_char)
    arr = array.array(format_char.replace('>', '').replace('<', ''))
    arr.frombytes(data)
    return arr


# Dictionary mapping CBOR tags to decoder functions
DECODERS: Dict[int, Callable[[CBORDecoder, bytes], Any]] = {
    # Big-endian decoders
    TagTypes.FLOAT64_BE: lambda _, data: decode_numeric_array(data, '>d'),
    TagTypes.FLOAT32_BE: lambda _, data: decode_numeric_array(data, '>f'),
    TagTypes.INT32_BE: lambda _, data: decode_numeric_array(data, '>i'),
    TagTypes.INT64_BE: lambda _, data: decode_numeric_array(data, '>q'),
    TagTypes.UINT32_BE: lambda _, data: decode_numeric_array(data, '>I'),

    # Little-endian decoders
    TagTypes.FLOAT64_LE: lambda _, data: decode_numeric_array(data, '<d'),
    TagTypes.FLOAT32_LE: lambda _, data: decode_numeric_array(data, '<f'),
    TagTypes.INT32_LE: lambda _, data: decode_numeric_array(data, '<i'),
    TagTypes.INT64_LE: lambda _, data: decode_numeric_array(data, '<q'),
    TagTypes.UINT32_LE: lambda _, data: decode_numeric_array(data, '<I'),

    # Endian-independent decoders
    TagTypes.UINT8: lambda _, data: decode_numeric_array(data, 'B'),
    TagTypes.INT8: lambda _, data: decode_numeric_array(data, 'b'),
}


def typed_array_decoder(decoder: CBORDecoder, tag: CBORTag) -> array.array:
    """
    CBOR tag decoder for typed arrays.

    Args:
        decoder: The CBOR decoder instance
        tag: The CBOR tag containing the typed array data

    Returns:
        array.array: A Python array containing the decoded numeric data

    Raises:
        ValueError: If the tag is not recognized or the data is invalid
    """
    if not isinstance(tag.value, bytes):
        raise ValueError(f"Expected bytes for typed array, got {type(tag.value)}")

    decoder_func = DECODERS.get(tag.tag)
    if decoder_func is None:
        raise ValueError(f"Unsupported typed array tag: {tag.tag}")

    try:
        return decoder_func(decoder, tag.value)
    except struct.error as e:
        raise ValueError(f"Invalid data for typed array: {e}")
