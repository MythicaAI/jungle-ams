import pytest
from cbor2 import dumps, loads

from decoder_array_cbor import *
from encoder_array_cbor import *


def test_decode_float64_array():
    # Create test data
    original = [1.0, -2.5, 3.14]
    encoded = next(encode_float64_array(original))

    # Test decoding
    decoded = loads(dumps(encoded), tag_hook=typed_array_decoder)
    assert isinstance(decoded, array.array)
    assert decoded.typecode == 'd'  # double precision float
    assert list(decoded) == pytest.approx(original)


def test_decode_uint8_array():
    original = [0, 128, 255]
    encoded = next(encode_uint8_array(original))

    decoded = loads(dumps(encoded), tag_hook=typed_array_decoder)
    assert isinstance(decoded, array.array)
    assert decoded.typecode == 'B'  # unsigned char
    assert list(decoded) == original


def test_decode_int32_array_endianness():
    original = [-2147483648, 0, 2147483647]

    # Test big-endian
    encoded_be = next(encode_int32_array(original, little_endian=False))
    decoded_be = loads(dumps(encoded_be), tag_hook=typed_array_decoder)
    assert list(decoded_be) == original

    # Test little-endian
    encoded_le = next(encode_int32_array(original, little_endian=True))
    decoded_le = loads(dumps(encoded_le), tag_hook=typed_array_decoder)
    assert list(decoded_le) == original


def test_decode_invalid_tag():
    # Create an invalid tag
    invalid_tag = CBORTag(999, b'invalid data')
    with pytest.raises(ValueError, match="Unsupported typed array tag"):
        loads(dumps(invalid_tag), tag_hook=typed_array_decoder)


def test_decode_invalid_data():
    # Create valid tag with invalid data
    invalid_data = CBORTag(TagTypes.FLOAT64_BE, b'too short')
    with pytest.raises(ValueError, match="Invalid data for typed array"):
        loads(dumps(invalid_data), tag_hook=typed_array_decoder)


def test_roundtrip():
    test_cases = [
        ([1.0, 2.0, 3.0], encode_float64_array, 'd'),
        ([1.0, 2.0, 3.0], lambda x: encode_float32_array(x), 'f'),
        ([1, 2, 3], lambda x: encode_int32_array(x), 'i'),
        ([0, 128, 255], encode_uint8_array, 'B'),
    ]

    for original, encoder, typecode in test_cases:
        encoded = next(encoder(original))
        decoded = loads(dumps(encoded), tag_hook=typed_array_decoder)
        assert decoded.typecode == typecode
        if typecode in ('d', 'f'):
            assert list(decoded) == pytest.approx(original)
        else:
            assert list(decoded) == original
