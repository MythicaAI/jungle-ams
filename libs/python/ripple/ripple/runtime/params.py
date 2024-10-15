import os
import requests

from http import HTTPStatus
from typing import Optional
from ripple.models.params import (
    ParameterSpec, 
    ParameterSpecModel, 
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
        if paramSpec.constant and name not in paramSet.model_fields.keys():
            default = None

            if isinstance(paramSpec, FileParameterSpec):
                if isinstance(paramSpec.default, list):
                    default = [FileParameter(file_id=file_id) for file_id in paramSpec.default]
                else:
                    default = FileParameter(file_id=paramSpec.default)
            else:
                default = paramSpec.default

            setattr(paramSet, name, default)

def validate_param(paramSpec: ParameterSpecModel, param, expectedType) -> bool:
           
    if isinstance(param, (list, tuple, set, frozenset)):
        for item in param:
            if not validate_param(paramSpec, item, expectedType):
                return False
        if len(param) != len(paramSpec.default):
            return False
    else:
        try:
            if expectedType in (bool,str,float,int):
                if not isinstance(param,expectedType):
                    return False
            else:
                expectedType(**param)
        except:
            print(f"Failed cast")
            return False
    return True

def validate_params(paramSpec: ParameterSpec, paramSet: ParameterSet) -> bool:
    params = paramSet.model_dump() 

    for name, paramSpec in paramSpec.params.items():
        if name not in params:
            return False
        
        param = params[name]

        # Validate type
        typematch = None
        if isinstance(paramSpec, IntParameterSpec):
            typematch=int
        elif isinstance(paramSpec, FloatParameterSpec):
            typematch=float
        elif isinstance(paramSpec, StringParameterSpec):
            typematch=str
        elif isinstance(paramSpec, BoolParameterSpec):
            typematch=bool
        elif isinstance(paramSpec, FileParameterSpec):
            typematch=FileParameter
        else:
            return False

        if typematch:
            if not validate_param(paramSpec,param,typematch):
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
    for name, param in paramSet.model_dump().items():
        if isinstance(param, FileParameter):
            param.file_path = download_file(endpoint, directory, param.file_id)
        elif isinstance(param, list) and all(isinstance(file_param, FileParameter) for file_param in param):
            for file_param in param:
                file_param.file_path = download_file(endpoint, directory, file_param.file_id)

    return True
