import os
from http import HTTPStatus

import aiofiles
import httpx
import requests
from ripple.models.params import (
    BoolParameterSpec,
    EnumParameterSpec,
    FileParameter,
    FileParameterSpec,
    FloatParameterSpec,
    IntParameterSpec,
    ParameterSet,
    ParameterSpec,
    ParameterSpecModel,
    StringParameterSpec,
)


class ParamError(ValueError):
    def __init__(self, label, message):
        super().__init__(f"`{label}`: {message}")


def populate_constants(paramSpec: ParameterSpec, paramSet: ParameterSet) -> None:
    """Populate all constant defaults from the paramSpec in the paramSet"""
    for name, paramSpec in paramSpec.params.items():
        if paramSpec.constant and name not in paramSet.model_fields.keys():
            if isinstance(paramSpec, FileParameterSpec):
                if isinstance(paramSpec.default, list):
                    default = [FileParameter(file_id=file_id) for file_id in paramSpec.default]
                else:
                    default = FileParameter(file_id=paramSpec.default)
            else:
                default = paramSpec.default

            setattr(paramSet, name, default)


def cast_numeric_types(paramSpec: ParameterSpec, paramSet: ParameterSet) -> None:
    """Implicitly cast int values to float"""
    for name, spec in paramSpec.params.items():
        if not hasattr(paramSet, name) or not isinstance(spec, FloatParameterSpec):
            continue

        value = getattr(paramSet, name)
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

    if isinstance(param, (list, tuple, set, frozenset)):
        if len(param) != len(paramSpec.default):
            raise ParamError(paramSpec.label, f"length mismatch {len(param)} != expected: {len(paramSpec.default)}")
        for item in param:
            validate_param(paramSpec, item, expectedType)
    else:
        allowed_atomic_types = {bool, str, float, int}
        if expectedType in allowed_atomic_types:
            if not isinstance(param, expectedType):
                raise ParamError(paramSpec.label,
                    f"type `{type(param).__name__}` did not match expected type `{expectedType.__name__}`")
        else:
            expectedType(**param)


def validate_params(paramSpecs: ParameterSpec, paramSet: ParameterSet) -> None:
    """Validate all parameters in the paramSpec using the provided paramSet"""
    params = paramSet.model_dump()

    for name, paramSpec in paramSpecs.params.items():
        if paramSpec.param_type=='file' and name not in params:
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
        elif isinstance(paramSpec, StringParameterSpec) or isinstance(paramSpec, EnumParameterSpec):
            use_type = str
        elif isinstance(paramSpec, BoolParameterSpec):
            use_type = bool
        elif isinstance(paramSpec, FileParameterSpec):
            use_type = FileParameter
        validate_param(paramSpec, param, use_type)

        # Validate enum
        if isinstance(paramSpec, EnumParameterSpec):
            validValues = {value.name for value in paramSpec.values}
            if param not in validValues:
                raise ParamError(paramSpec.label, f"{param} not in {validValues}")

        # Validate constant
        if paramSpec.constant:
            if isinstance(paramSpec, FileParameterSpec):
                file_ids = [file_param['file_id']  \
                            for file_param in param] \
                    if isinstance(param, list) else param['file_id']
                if file_ids != paramSpec.default:
                    raise ParamError(paramSpec.label, f"{file_ids} != {paramSpec.default}")
            else:
                if param != paramSpec.default:
                    raise ParamError(paramSpec.label, f"constant mismatch `{param}` != expected: `{paramSpec.default}`")


async def download_file(endpoint: str, directory: str, file_id: str, headers={}) -> str:
    """Automatically download an entire file at runtime, used to resolve file references"""
    # Get the URL to download the file
    url = f"{endpoint}/download/info/{file_id}"
    
    async with httpx.AsyncClient() as client:
        r = await client.get(url, headers=headers)
        assert r.status_code == HTTPStatus.OK
        doc: dict = r.json()

        # Download the file
        file_name = file_id + "_" + doc['name'].replace('\\', '_').replace('/', '_')
        file_path = os.path.join(directory, file_name)

        async with client.stream("GET", doc['url'], headers=headers) as download_req:
            async with aiofiles.open(file_path, "wb") as f:
                async for chunk in download_req.aiter_bytes(chunk_size=1024):
                    await f.write(chunk)

    return file_path


async def resolve_params(endpoint: str, directory: str, paramSet: ParameterSet, headers=None) -> ParameterSet:
    """Resolve any parameters that are external references"""
    async def resolve(field, value):
        # For list-like, check each value
        if isinstance(value, (list, tuple, set, frozenset)):
            for item in value:
                await resolve(field, item)
        # For Dicts, check if they are FileParams. Otherwise check each item        
        elif isinstance(value, FileParameter):
            value.file_path = await download_file(endpoint, directory, value.file_id, headers or {})
        elif isinstance(value, dict):
            try:
                FileParameter(**value)
                value['file_path'] = await download_file(endpoint, directory, value['file_id'], headers)
            except Exception:
                for key, item in value.items():
                    await resolve(f"{field}:{key}", item)

    for name in paramSet.model_fields.keys():
        await resolve(name, getattr(paramSet, name))
    for name in paramSet.model_extra.keys():
        await resolve(name, getattr(paramSet, name))

    return paramSet
