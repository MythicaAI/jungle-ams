from pxr import Gf, Sdf, Usd, UsdGeom, Vt

from encoder_cbor import *


def convert_usd_value(value):
    """
    Convert USD-specific types into standard Python types that can be serialized.
    """
    if isinstance(value, Gf.Vec3f) or isinstance(value, Gf.Vec3d):
        return [value[0], value[1], value[2]]  # Convert Vec3 to a list

    elif isinstance(value, Gf.Vec2f) or isinstance(value, Gf.Vec2d):
        return [value[0], value[1]]  # Convert Vec2 to a list

    elif isinstance(value, Gf.Vec4f) or isinstance(value, Gf.Vec4d):
        return [value[0], value[1], value[2], value[3]]  # Convert Vec4 to a list

    elif isinstance(value, Gf.Quatf) or isinstance(value, Gf.Quatd):
        return [value.GetReal(), *value.GetImaginary()]  # Convert Quaternion to [real, x, y, z]

    elif isinstance(value, Gf.Matrix4d):
        return [list(row) for row in value]  # Convert Matrix4d to list of lists

    elif isinstance(value, Vt.TokenArray) or isinstance(value, Vt.StringArray):
        return list(value)  # Convert TokenArray and StringArray to a list of strings

    elif (isinstance(value, Vt.IntArray) \
          or isinstance(value, Vt.BoolArray) \
          or isinstance(value, Vt.FloatArray) \
          or isinstance(value, Vt.DoubleArray)):
        return list(value)  # Convert numeric arrays to lists

    elif isinstance(value, Vt.Vec2fArray) \
            or isinstance(value, Vt.Vec2dArray) \
            or isinstance(value, Vt.Vec3fArray) \
            or isinstance(value, Vt.Vec3dArray):
        return [list(v) for v in value]  # Convert Vec3fArray to a list of lists

    elif isinstance(value, Vt.Matrix4dArray):
        return [[list(row) for row in matrix] for matrix in value]  # Convert Matrix4dArray

    elif isinstance(value, Sdf.Path):
        return str("path: " + value)  # Convert Sdf.Path to string

    elif isinstance(value, Sdf.AssetPath):
        return str("asset_path: " + value.path)  # Convert Sdf.AssetPath to string

    elif isinstance(value, bool) \
            or isinstance(value, int) \
            or isinstance(value, float) \
            or isinstance(value, str) \
            or isinstance(value, list) \
            or isinstance(value, dict):
        return value  # If already serializable, return as is

    raise ValueError(f"Unsupported USD type: {type(value)}")
    # return str(value)  # Convert any unknown USD type to a string for safety


def traverse_prim(prim, depth=0):
    """Recursively stream a USD prim and its attributes."""
    # Encode BEGIN
    yield encode_begin("Prim", prim.GetName(), depth)

    # Stream prim attributes
    for attr in prim.GetAttributes():
        value = attr.Get()
        attr_type = str(attr.GetTypeName())  # Get USD type as string
        if value is not None:
            yield encode_attribute(attr.GetName(), attr_type, convert_usd_value(value))

    # Stream transformation matrix (if it exists)
    xform = UsdGeom.Xform(prim)
    if xform:
        transform = xform.GetLocalTransformation()
        floats = [*convert_usd_value(transform[0]),
                  *convert_usd_value(transform[1]),
                  *convert_usd_value(transform[2]),
                  *convert_usd_value(transform[3])]
        yield encode_transform("transform", floats)  # TODO RowMajor? provide differentiator

    # Recursively stream child prims
    for child in prim.GetChildren():
        yield from traverse_prim(child, depth + 1)

    # Encode END Prim
    yield encode_end(depth)


def frame_reader_usd(file_path: str):
    """Reads a USD file and streams it using an encoder."""
    stage = Usd.Stage.Open(file_path)
    yield from encode_begin("File", file_path, 0)

    # Stream the root layer first
    root_layer = stage.GetRootLayer()
    yield encode_begin("Layer", root_layer.identifier, 1)

    # Traverse the scene
    for prim in stage.Traverse():
        yield from traverse_prim(prim, depth=1)

    # Close the layer
    yield encode_end(1)

    # Close the file
    yield from encode_end(0)
