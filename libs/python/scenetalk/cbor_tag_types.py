from enum import IntEnum


class TagTypes(IntEnum):
    DATETIME = 0  # TODO: validate
    TIMESTAMP_INT = 1  # TODO: validate

    # Big-endian types
    UINT16_BE = 65
    UINT32_BE = 66
    UINT64_BE = 67
    INT16_BE = 73
    INT32_BE = 74
    INT64_BE = 75
    FLOAT16_BE = 80
    FLOAT32_BE = 81
    FLOAT64_BE = 82

    # Little-endian types
    UINT16_LE = 69
    UINT32_LE = 70
    UINT64_LE = 71
    INT16_LE = 77
    INT32_LE = 78
    INT64_LE = 79
    FLOAT16_LE = 84
    FLOAT32_LE = 85
    FLOAT64_LE = 86

    # Endian-independent types
    UINT8 = 64  # Single bytes have no endianness
    INT8 = 72  # Single bytes have no endianness
