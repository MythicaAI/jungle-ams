import os
import requests

from http import HTTPStatus
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


def download_file(endpoint: str, directory: str, file_id: str) -> str:
    # Get the URL to download the file
    url = f"{endpoint}/download/info/{file_id}"
    r = requests.get(url)
    assert r.status_code == HTTPStatus.OK
    doc = r.json()

    # Download the file
    file_path = os.path.join(directory, file_id)

    downloaded_bytes = 0
    with open(file_path, "w+b") as f:
        download_req = requests.get(doc['url'], stream=True)
        for chunk in download_req.iter_content(chunk_size=1024):
            if chunk:
                downloaded_bytes += len(chunk)
                f.write(chunk)

    return file_path


def resolve_file_param(endpoint: str, directory: str, param: FileParameter) -> FileParameterResolved:
    file_path = download_file(endpoint, directory, param.file_id)
    return FileParameterResolved(file_id=param.file_id, file_path=file_path)


def resolve_params(endpoint: str, directory: str, paramSet: ParameterSet) -> Optional[ParameterSetResolved]:
    params_resolved = {}

    for name, param in paramSet.params.items():
        if isinstance(param, FileParameter):
            params_resolved[name] = resolve_file_param(endpoint, directory, param)
        elif isinstance(param, list) and all(isinstance(file_param, FileParameter) for file_param in param):
            params_resolved[name] = [resolve_file_param(endpoint, directory, file_param) 
                                      for file_param in param]
        else:
            params_resolved[name] = paramSet.params[param]

    return ParameterSetResolved(params=params_resolved)
