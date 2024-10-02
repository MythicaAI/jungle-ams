from typing import Optional
from ripple.models.params import (
    ParameterSpec, 
    ParameterSet, 
    ParameterSetResolved, 
    IntParameterSpec, 
    FloatParameterSpec, 
    StringParameterSpec, 
    BoolParameterSpec,
    FileParameterSpec, 
    FileParameter, 
    FileParameterResolved
)


def validate_params(paramSpec: ParameterSpec, paramSet: ParameterSet) -> bool:
    for name, value in paramSpec.params.items():
        if name not in paramSet.params:
            return False
        
        if isinstance(value, IntParameterSpec):
            if not isinstance(paramSet.params[name], int):
                return False
        elif isinstance(value, FloatParameterSpec):
            if not isinstance(paramSet.params[name], float):
                return False
        elif isinstance(value, StringParameterSpec):
            if not isinstance(paramSet.params[name], str):
                return False
        elif isinstance(value, BoolParameterSpec):
            if not isinstance(paramSet.params[name], bool):
                return False
        elif isinstance(value, FileParameterSpec):
            if not isinstance(paramSet.params[name], FileParameter):
                return False
        else:
            return False

    return True


def resolve_params(paramSet: ParameterSet) -> Optional[ParameterSetResolved]:
    params_resolved = {}

    for param in paramSet.params:
        if isinstance(paramSet.params[param], FileParameter):
            # TODO: Download file_id from API
            params_resolved[param] = FileParameterResolved(file_path=f'/path/to/downloaded/{paramSet.params[param].file_id}')
        else:
            params_resolved[param] = paramSet.params[param]

    return ParameterSetResolved(params=params_resolved)
