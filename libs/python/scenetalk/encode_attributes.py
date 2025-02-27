from typing import Iterator, List

from encoder_array_cbor import encode_float64_array
from encoder_cbor import encode_attribute


def encode_attr_transform(name: str, matrix: List[float]) -> Iterator[bytes]:
    """Encodes a transform attribute frame."""
    assert len(matrix) == 16
    payload = encode_float64_array(matrix)
    yield from encode_attribute(name, "Matrix4d", payload)
