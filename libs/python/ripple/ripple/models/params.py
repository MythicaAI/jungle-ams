from typing import Optional
from uuid import uuid4

from pydantic import BaseModel


class IntParameterSpec(BaseModel):
    label: str
    min: Optional[int] = None
    max: Optional[int] = None
    default: int | list[int]


class FloatParameterSpec(BaseModel):
    label: str
    min: Optional[float] = None
    max: Optional[float] = None
    default: float | list[float]


class StringParameterSpec(BaseModel):
    label: str
    default: str


class BoolParameterSpec(BaseModel):
    label: str
    default: bool


class ParameterSpec(BaseModel):
    """ 
    Specification of parameters a job expects as input
    """
    inputs: list[str]
    params: dict[str, IntParameterSpec | FloatParameterSpec | StringParameterSpec | BoolParameterSpec]


class ParameterSet(BaseModel):
    """
    Set of parameter values provided by a client for a job
    """
    inputs: list[str]   # List of file_ids
    params: dict[str, int | float | str | bool]


class ParameterSetResolved(BaseModel):
    """
    Set of parameter values resolved to local files are ready to be used by a job
    """
    inputs: list[str]   # List of local file paths
    params: dict[str, int | float | str | bool]
