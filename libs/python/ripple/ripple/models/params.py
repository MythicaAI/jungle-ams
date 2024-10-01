from typing import Optional
from uuid import uuid4

from pydantic import BaseModel


class ParameterSpecModel(BaseModel):
    label: str
    constant: bool = False


class IntParameterSpec(ParameterSpecModel):
    default: int | list[int]
    min: Optional[int] = None
    max: Optional[int] = None


class FloatParameterSpec(ParameterSpecModel):
    default: float | list[float]
    min: Optional[float] = None
    max: Optional[float] = None


class StringParameterSpec(ParameterSpecModel):
    default: str


class BoolParameterSpec(ParameterSpecModel):
    default: bool


class FileParameterSpec(ParameterSpecModel):
    default: str


class ParameterSpec(BaseModel):
    """ 
    Specification of parameters a job expects as input
    """
    params: dict[str, IntParameterSpec | FloatParameterSpec | StringParameterSpec | BoolParameterSpec | FileParameterSpec]


class FileParameter(BaseModel):
    file_id: str


class ParameterSet(BaseModel):
    """
    Set of parameter values provided by a client for a job
    """
    params: dict[str, int | float | str | bool | FileParameter]


class FileParameterResolved(BaseModel):
    file_path: str


class ParameterSetResolved(BaseModel):
    """
    Set of parameter values resolved to local files are ready to be used by a job
    """
    params: dict[str, int | float | str | bool | FileParameterResolved]
