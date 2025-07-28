import os
from http import HTTPStatus

import requests

from meshwork.models.params import (
    BoolParameterSpec,
    EnumParameterSpec,
    FileParameter,
    FileParameterSpec,
    FloatParameterSpec,
    IntParameterSpec,
    ParameterSet,
    ParameterSpec,
    ParameterSpecModel,
    RampParameterSpec,
    StringParameterSpec,
)
from meshwork.models.houTypes import rampParmType, rampBasis


class ParamError(ValueError):
    def __init__(self, label, message):
        super().__init__(f"`{label}`: {message}")


def populate_constants(paramSpec: ParameterSpec, paramSet: ParameterSet) -> None:
    """Populate all constant defaults from the paramSpec in the paramSet"""
    for name, paramSpec in paramSpec.params.items():
        if paramSpec.constant and name not in paramSet.model_fields.keys():
            if isinstance(paramSpec, FileParameterSpec):
                if isinstance(paramSpec.default, list):
                    default = [
                        FileParameter(file_id=file_id) for file_id in paramSpec.default
                    ]
                else:
                    default = FileParameter(file_id=paramSpec.default)
            else:
                default = paramSpec.default

            setattr(paramSet, name, default)


def cast_numeric_types(paramSpec: ParameterSpec, paramSet: ParameterSet) -> None:
    """Implicitly cast int values to float"""
    for name, spec in paramSpec.params.items():
        if not hasattr(paramSet, name):
            continue

        value = getattr(paramSet, name)

        if isinstance(spec, RampParameterSpec):
            rampType = spec.ramp_parm_type
            if rampType == rampParmType.Color:
                vals = "c"
            else:
                vals = "value"

            newValue = []
            for item in value:
                newItem = item
                if isinstance(item["pos"], int):
                    newItem["pos"] = float(item["pos"])
                if rampType == rampParmType.Color:
                    if isinstance(item[vals], list):
                        for index, c in enumerate(item[vals]):
                            if isinstance(c, int):
                                newItem[vals][index] = float(c)
                else:
                    if isinstance(item[vals], int):
                        newItem[vals] = float(item[vals])
                newValue.append(newItem)
            setattr(paramSet, name, newValue)

        if not isinstance(spec, FloatParameterSpec):
            continue

        if isinstance(spec.default, float):
            if isinstance(value, int):
                setattr(paramSet, name, float(value))
        elif isinstance(spec.default, list):
            if isinstance(value, list) and len(spec.default) == len(value):
                for i in range(len(spec.default)):
                    if isinstance(spec.default[i], float) and isinstance(value[i], int):
                        value[i] = float(value[i])


def repair_parameters(paramSpec: ParameterSpec, paramSet: ParameterSet) -> None:
    """Combine constant population and numerical casts"""
    populate_constants(paramSpec, paramSet)
    cast_numeric_types(paramSpec, paramSet)


def validate_param(paramSpec: ParameterSpecModel, param, expectedType) -> None:
    """Validate the parameter against the spec and expected type"""
    if not expectedType:
        raise ParamError(paramSpec.label, f"invalid type validation")

    if isinstance(paramSpec, RampParameterSpec):
        # Check that param is a list of expectedType
        if not isinstance(param, list):
            raise ParamError(
                paramSpec.label,
                f"ramp params must be list of dict, got {type(param).__name__}",
            )
        for item in param:
            rampType = paramSpec.ramp_parm_type
            if rampType == rampParmType.Color:
                vals = "c"
            else:
                vals = "value"

            if not isinstance(item, expectedType):
                raise ParamError(
                    paramSpec.label,
                    f"ramp point must be of type dict, got {type(item).__name__}",
                )
            if "pos" not in item or vals not in item or "interp" not in item:
                raise ParamError(
                    paramSpec.label,
                    f"ramp point must contain 'pos' and 'value|c' and 'interp' keys",
                )
            if not isinstance(item["pos"], float):
                raise ParamError(
                    paramSpec.label, f"ramp point 'pos' must be of type float"
                )
            if rampType == rampParmType.Color:
                if not isinstance(item[vals], list):
                    raise ParamError(
                        paramSpec.label, f"ramp point color 'c' must be of type list"
                    )
                if len(item[vals]) != 3:
                    raise ParamError(
                        paramSpec.label, f"ramp point color 'c' must be of length 3"
                    )
                for c in item[vals]:
                    if not isinstance(c, float):
                        raise ParamError(
                            paramSpec.label,
                            f"ramp point color 'c' must be of type list of floats",
                        )
            else:
                if not isinstance(item[vals], float):
                    raise ParamError(
                        paramSpec.label, f"ramp point 'value' must be of type float"
                    )
            # check that interp is a valid value from rampBasis
            if item["interp"] not in [basis.name for basis in rampBasis]:
                raise ParamError(
                    paramSpec.label,
                    f"ramp point 'interp' must be a valid value from hou.rampBasis",
                )

    elif isinstance(param, (list, tuple, set, frozenset)):
        if len(param) != len(paramSpec.default):
            raise ParamError(
                paramSpec.label,
                f"length mismatch {len(param)} != expected: {len(paramSpec.default)}",
            )
        for item in param:
            validate_param(paramSpec, item, expectedType)
    else:
        allowed_atomic_types = {bool, str, float, int}
        if expectedType in allowed_atomic_types:
            if not isinstance(param, expectedType):
                raise ParamError(
                    paramSpec.label,
                    f"type `{type(param).__name__}` did not match expected type `{expectedType.__name__}`",
                )
        else:
            expectedType(**param)


def validate_params(paramSpecs: ParameterSpec, paramSet: ParameterSet) -> None:
    """Validate all parameters in the paramSpec using the provided paramSet"""
    params = paramSet.model_dump()

    for name, paramSpec in paramSpecs.params.items():
        if paramSpec.param_type == "file" and name not in params:
            raise ParamError(paramSpec.label, "param not provided")
        elif name not in params:
            continue

        param = params[name]

        # Validate type
        use_type = None
        if isinstance(paramSpec, IntParameterSpec):
            use_type = int
        elif isinstance(paramSpec, FloatParameterSpec):
            use_type = float
        elif isinstance(paramSpec, StringParameterSpec) or isinstance(
            paramSpec, EnumParameterSpec
        ):
            use_type = str
        elif isinstance(paramSpec, BoolParameterSpec):
            use_type = bool
        elif isinstance(paramSpec, FileParameterSpec):
            use_type = FileParameter
        elif isinstance(paramSpec, RampParameterSpec):
            use_type = dict
        validate_param(paramSpec, param, use_type)

        # Validate enum
        if isinstance(paramSpec, EnumParameterSpec):
            validValues = {value.name for value in paramSpec.values}
            if param not in validValues:
                raise ParamError(paramSpec.label, f"{param} not in {validValues}")

        # Validate constant
        if paramSpec.constant:
            if isinstance(paramSpec, FileParameterSpec):
                file_ids = (
                    [file_param["file_id"] for file_param in param]
                    if isinstance(param, list)
                    else param["file_id"]
                )
                if file_ids != paramSpec.default:
                    raise ParamError(
                        paramSpec.label, f"{file_ids} != {paramSpec.default}"
                    )
            else:
                if param != paramSpec.default:
                    raise ParamError(
                        paramSpec.label,
                        f"constant mismatch `{param}` != expected: `{paramSpec.default}`",
                    )


def download_file(endpoint: str, directory: str, file_id: str, headers={}) -> str:
    """Automatically download an entire file at runtime, used to resolve file references"""
    # Get the URL to download the file
    url = f"{endpoint}/download/info/{file_id}"
    r = requests.get(url, headers=headers)
    assert r.status_code == HTTPStatus.OK
    doc = r.json()

    # Download the file
    file_name = file_id + "_" + doc["name"].replace("\\", "_").replace("/", "_")
    file_path = os.path.join(directory, file_name)

    downloaded_bytes = 0
    with open(file_path, "w+b") as f:
        download_req = requests.get(doc["url"], stream=True, headers=headers)
        for chunk in download_req.iter_content(chunk_size=1024):
            if chunk:
                downloaded_bytes += len(chunk)
                f.write(chunk)

    return file_path


def resolve_params(
    endpoint: str, directory: str, paramSet: ParameterSet, headers=None
) -> ParameterSet:
    """Resolve any parameters that are external references"""

    def resolve(field, value):
        # For list-like, check each value
        if isinstance(value, (list, tuple, set, frozenset)):
            for item in value:
                resolve(field, item)
        # For Dicts, check if they are FileParams. Otherwise check each item
        elif isinstance(value, FileParameter):
            value.file_path = download_file(
                endpoint, directory, value.file_id, headers or {}
            )
        elif isinstance(value, dict):
            try:
                FileParameter(**value)
                value["file_path"] = download_file(
                    endpoint, directory, value["file_id"], headers
                )
            except Exception:
                for key, item in value.items():
                    resolve(f"{field}:{key}", item)

    for name in paramSet.model_fields.keys():
        resolve(name, getattr(paramSet, name))
    for name in paramSet.model_extra.keys():
        resolve(name, getattr(paramSet, name))

    return paramSet
