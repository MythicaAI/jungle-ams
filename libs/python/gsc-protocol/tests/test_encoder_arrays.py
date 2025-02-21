import pytest

from encoder_array_cbor import *


def test_encode_float64_array():
    # Test basic big-endian encoding
    data = [1.0, -2.5, 3.14, 0.0]
    result = encode_float64_array(data)

    assert isinstance(result, CBORTag)
    assert result.tag == TagTypes.FLOAT64_BE
    # Verify the packed data matches expected binary format
    expected = struct.pack(">4d", *data)
    assert result.value == expected

    # Test little-endian encoding
    result_le = encode_float64_array(data, little_endian=True)
    assert result_le.tag == TagTypes.FLOAT64_LE
    expected_le = struct.pack("<4d", *data)
    assert result_le.value == expected_le


def test_encode_float32_array():
    data = [1.0, -2.5, 3.14, 0.0]
    result = encode_float32_array(data)

    assert isinstance(result, CBORTag)
    assert result.tag == TagTypes.FLOAT32_BE
    expected = struct.pack(">4f", *data)
    assert result.value == expected

    # Verify data roundtrips through float32 precision
    unpacked = struct.unpack(">4f", result.value)
    assert len(unpacked) == len(data)
    for orig, roundtrip in zip(data, unpacked):
        assert abs(orig - roundtrip) < 1e-6  # Allow for float32 precision loss


def test_encode_int32_array():
    data = [-2147483648, 0, 2147483647]  # Min, zero, and max 32-bit integers
    result = encode_int32_array(data)

    assert isinstance(result, CBORTag)
    assert result.tag == TagTypes.INT32_BE
    expected = struct.pack(">3i", *data)
    assert result.value == expected


def test_encode_uint8_array():
    data = [0, 128, 255]  # Min, mid, and max uint8 values
    result = encode_uint8_array(data)

    assert isinstance(result, CBORTag)
    assert result.tag == TagTypes.UINT8
    expected = struct.pack("3B", *data)
    assert result.value == expected


def test_error_handling():
    # Test invalid input types
    with pytest.raises(struct.error):
        encode_int32_array([2 ** 32])  # Too large for int32

    with pytest.raises(struct.error):
        encode_uint8_array([256])  # Too large for uint8

    with pytest.raises(struct.error):
        encode_uint8_array([-1])  # Negative not allowed for uint8


def test_empty_arrays():
    # Test encoding empty arrays
    assert encode_float64_array([]).value == b""
    assert encode_float32_array([]).value == b""
    assert encode_int32_array([]).value == b""
    assert encode_uint8_array([]).value == b""


def test_array_like_inputs():
    # Test that we can handle different sequence types
    from array import array

    # Test with array.array
    float_arr = array('d', [1.0, 2.0, 3.0])
    result = encode_float64_array(float_arr)
    assert isinstance(result, CBORTag)
    assert len(result.value) == 8 * len(float_arr)

    # Test with tuple
    int_tuple = (1, 2, 3)
    result = encode_int32_array(int_tuple)
    assert isinstance(result, CBORTag)
    assert len(result.value) == 4 * len(int_tuple)


def test_endianness():
    data = [1.0]
    be_result = encode_float64_array(data, little_endian=False)
    le_result = encode_float64_array(data, little_endian=True)

    # Results should be different for different endianness
    assert be_result.value != le_result.value

    # But should decode to same value
    be_value = struct.unpack(">d", be_result.value)[0]
    le_value = struct.unpack("<d", le_result.value)[0]
    assert be_value == le_value == data[0]
