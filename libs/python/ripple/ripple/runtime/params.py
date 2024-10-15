import os
import requests

from http import HTTPStatus
from typing import Optional
from ripple.models.params import (
    ParameterSpec, 
    ParameterSet, 
    IntParameterSpec, 
    FloatParameterSpec, 
    StringParameterSpec, 
    BoolParameterSpec,
    FileParameterSpec, 
    FileParameter
)


def populate_constants(paramSpec: ParameterSpec, paramSet: ParameterSet) -> None:
    for name, paramSpec in paramSpec.params.items():
        if paramSpec.constant and name not in paramSet.params:
            default = None

            if isinstance(paramSpec, FileParameterSpec):
                if isinstance(paramSpec.default, list):
                    default = [FileParameter(file_id=file_id) for file_id in paramSpec.default]
                else:
                    default = FileParameter(file_id=paramSpec.default)
            else:
                default = paramSpec.default

            paramSet.params[name] = default


def validate_params(paramSpec: ParameterSpec, paramSet: ParameterSet) -> bool:
    for name, paramSpec in paramSpec.params.items():
        if name not in paramSet.params:
            return False
        
        param = paramSet.params[name]

        # Validate type
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

        # Validate constant
        if paramSpec.constant:
            if isinstance(paramSpec, FileParameterSpec):
                file_ids = [file_param.file_id for file_param in param] if isinstance(param, list) else param.file_id
                if file_ids != paramSpec.default:
                    return False
            else:
                if param != paramSpec.default:
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


def resolve_params(endpoint: str, directory: str, paramSet: ParameterSet) -> bool:
    for name, param in paramSet.params.items():
        if isinstance(param, FileParameter):
            param.file_path = download_file(endpoint, directory, param.file_id)
        elif isinstance(param, list) and all(isinstance(file_param, FileParameter) for file_param in param):
            for file_param in param:
                file_param.file_path = download_file(endpoint, directory, file_param.file_id)

    return True
