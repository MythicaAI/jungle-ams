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
    for name, paramSpec in paramSpec.params.items():
        if name not in paramSet.params:
            return False
        
        param = paramSet.params[name]

        if isinstance(paramSpec, IntParameterSpec):
            if not isinstance(param, int) and not (isinstance(param, list) and all(isinstance(p, int) for p in param) and len(param) == len(paramSpec.default)):
                return False
        elif isinstance(paramSpec, FloatParameterSpec):
            if not isinstance(param, float) and not (isinstance(param, list) and all(isinstance(p, float) for p in param) and len(param) == len(paramSpec.default)):
                return False
        elif isinstance(paramSpec, StringParameterSpec):
            if not isinstance(param, str) and not (isinstance(param, list) and all(isinstance(p, str) for p in param) and len(param) == len(paramSpec.default)):
                return False
        elif isinstance(paramSpec, BoolParameterSpec):
            if not isinstance(param, bool):
                return False
        elif isinstance(paramSpec, FileParameterSpec):
            if not isinstance(param, FileParameter) and not (isinstance(param, list) and all(isinstance(p, FileParameter) for p in param) and len(param) == len(paramSpec.default)):
                return False
        else:
            return False

    return True


# TODO: Download file_id from API
def download_file(file_id: str) -> str:
    return f'/path/to/downloaded/{file_id}'


def resolve_params(paramSet: ParameterSet) -> Optional[ParameterSetResolved]:
    params_resolved = {}

    for param in paramSet.params:
        if isinstance(paramSet.params[param], FileParameter):
            file_path = download_file(paramSet.params[param].file_id)
            params_resolved[param] = FileParameterResolved(file_path=file_path)
        elif isinstance(paramSet.params[param], list[FileParameter]):
            file_paths = [download_file(file_id) for file_id in paramSet.params[param]]
            params_resolved[param] = [FileParameterResolved(file_path=file_path) for file_path in file_paths]
        else:
            params_resolved[param] = paramSet.params[param]

    return ParameterSetResolved(params=params_resolved)
