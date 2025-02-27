import array
import struct
from datetime import datetime
from typing import Any, Callable, Dict, Union

from cbor2 import CBORDecoder, CBORTag

from cbor_tag_types import TagTypes
from decoder_array_cbor import decode_numeric_array


def decode_datetime_string(decoder: CBORDecoder, value: str) -> datetime:
    """Decode ISO format datetime string."""
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError as e:
        raise ValueError(f"Invalid ISO format datetime string: {e}")


def decode_timestamp_int(decoder: CBORDecoder, value: int) -> datetime:
    """Decode UNIX timestamp integer."""
    try:
        return datetime.fromtimestamp(value)
    except (ValueError, OSError) as e:
        raise ValueError(f"Invalid UNIX timestamp: {e}")


# Update the decoders dictionary to include datetime decoders
TAG_HOOKS: Dict[int, Callable[[CBORDecoder, Any], Any]] = {
    # Datetime decoders
    TagTypes.DATETIME: decode_datetime_string,
    TagTypes.TIMESTAMP_INT: decode_timestamp_int,

    # Existing typed array decoders
    TagTypes.FLOAT64_BE: lambda _, data: decode_numeric_array(data, '>d'),
    # ... rest of existing decoders ...
}


def cbor_decoder(decoder: CBORDecoder, tag: CBORTag) -> Union[array.array, datetime]:
    """
    CBOR tag decoder for typed arrays and datetimes.

    Args:
        decoder: The CBOR decoder instance
        tag: The CBOR tag containing the data

    Returns:
        Union[array.array, datetime]: Decoded data

    Raises:
        ValueError: If the tag is not recognized or the data is invalid
    """
    decoder_func = CBOR_DECODERS.get(tag.tag)
    if decoder_func is None:
        raise ValueError(f"Unsupported tag: {tag.tag}")

    try:
        return decoder_func(decoder, tag.value)
    except (struct.error, ValueError) as e:
        raise ValueError(f"Invalid data for tag {tag.tag}: {e}")
