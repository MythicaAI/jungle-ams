from functools import partial

import numpy as np
from cbor2 import CBOREncodeValueError, CBORTag, dump, dumps, load, loads
from cbor2.tag_handler import TagHandler

# Note: Numpy does not support IEEE binary128 floats. It uses float128 and
# float96 types to represent 80 bit plaform long-doubles in a memory aligned way
# These can always be stored as their 64-bit representation
_1D_ARRAY_TO_TAGS = {
    "|u1": 64,
    ">u2": 65,
    ">u4": 66,
    ">u8": 67,
    # "|u1": 68, # Clamped ints from javascript
    "<u2": 69,
    "<u4": 70,
    "<u8": 71,
    "|i1": 72,
    ">i2": 73,
    ">i4": 74,
    ">i8": 75,
    "<i2": 77,
    "<i4": 78,
    "<i8": 79,
    ">f2": 80,
    ">f4": 81,
    ">f8": 82,
    "<f2": 84,
    "<f4": 85,
    "<f8": 86,
}
_1D_ARRAY_FROM_TAGS = {
    64: "|u1",
    65: ">u2",
    66: ">u4",
    67: ">u8",
    68: "|u1",
    69: "<u2",
    70: "<u4",
    71: "<u8",
    72: "|i1",
    73: ">i2",
    74: ">i4",
    75: ">i8",
    77: "<i2",
    78: "<i4",
    79: "<i8",
    80: ">f2",
    81: ">f4",
    82: ">f8",
    84: "<f2",
    85: "<f4",
    86: "<f8",
}


def encode_arrays(encoder, value):
    if isinstance(value, np.ndarray):
        if value.dtype == np.longdouble:
            value = value.astype(np.float64, casting="same_kind", subok=False)
        dtype = value.dtype.base.str
        dim = value.ndim
        tag_id = _1D_ARRAY_TO_TAGS.get(dtype)
        if dim == 1 and tag_id is not None:
            encoder.encode(CBORTag(tag_id, value.tobytes()))
        elif tag_id is None:
            # tag as a homogenous array to save space
            # tolist() preserves shape.
            encoder.encode(CBORTag(41, value.tolist()))
        else:
            # Always write in row-major order.
            output = [value.shape, CBORTag(tag_id, value.tobytes("C"))]
            encoder.encode(CBORTag(40, output))
    else:
        raise CBOREncodeValueError(
            f"unable to serialize {value.__class__.__name__} instance"
        )


class ArrayHandler(TagHandler):
    __slots__ = ("array_1d_tags",)

    def __init__(self):
        super().__init__()
        self.handlers[40] = self.unmarshal_ndarray
        self.handlers[1040] = self.unmarshal_fdarray
        self.array_1d_tags = _1D_ARRAY_FROM_TAGS

    def __call__(self, tag):
        # Fast path for 1D arrays
        if tag.tag == 41:
            # homogenous any datatype
            return np.array(tag.value)
        if tag.tag in self.array_1d_tags:
            # homogenous numeric buffer
            return np.frombuffer(tag.value, dtype=self.array_1d_tags[tag.tag])
        # default tag handling.
        handler = self.handlers.get(tag.tag)
        if handler is None:
            return tag
        return handler(tag.value)

    @staticmethod
    def unmarshal_ndarray(value):
        shape, payload = value
        return payload.reshape(*shape)

    @staticmethod
    def unmarshal_fdarray(value):
        shape, payload = value
        return payload.reshape(*shape, order="F")


array_dump = partial(dump, default=encode_arrays)
array_dumps = partial(dumps, default=encode_arrays)
array_load = partial(load, tag_hook=ArrayHandler())
array_loads = partial(loads, tag_hook=ArrayHandler())
