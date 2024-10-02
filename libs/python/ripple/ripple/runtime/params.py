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


def resolve_params(endpoint: str, directory: str, paramSet: ParameterSet) -> Optional[ParameterSetResolved]:
    params_resolved = {}

    for param in paramSet.params:
        if isinstance(paramSet.params[param], FileParameter):
            file_path = download_file(endpoint, directory, paramSet.params[param].file_id)
            params_resolved[param] = FileParameterResolved(file_path=file_path)
        elif isinstance(paramSet.params[param], list[FileParameter]):
            file_paths = [download_file(endpoint, directory, file_id) for file_id in paramSet.params[param]]
            params_resolved[param] = [FileParameterResolved(file_path=file_path) for file_path in file_paths]
        else:
            params_resolved[param] = paramSet.params[param]

    return ParameterSetResolved(params=params_resolved)
