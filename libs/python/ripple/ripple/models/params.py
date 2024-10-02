from pydantic import BaseModel, Field, StrictInt, StrictFloat
from typing import Annotated, Literal, Optional, Union
from uuid import uuid4


class ParameterSpecModel(BaseModel):
    param_type: str
    label: str
    constant: bool = False


class IntParameterSpec(ParameterSpecModel):
    param_type: Literal['int'] = 'int'
    default: int | list[int]
    min: Optional[int] = None
    max: Optional[int] = None


class FloatParameterSpec(ParameterSpecModel):
    param_type: Literal['float'] = 'float'
    default: float | list[float]
    min: Optional[float] = None
    max: Optional[float] = None


class StringParameterSpec(ParameterSpecModel):
    param_type: Literal['string'] = 'string'
    default: str | list[str]


class BoolParameterSpec(ParameterSpecModel):
    param_type: Literal['bool'] = 'bool'
    default: bool


class FileParameterSpec(ParameterSpecModel):
    param_type: Literal['file'] = 'file'
    default: str | list[str]


ParameterSpecType = Annotated[
    Union[
        IntParameterSpec,
        FloatParameterSpec,
        StringParameterSpec,
        BoolParameterSpec,
        FileParameterSpec
    ],
    Field(discriminator='param_type')
]

class ParameterSpec(BaseModel):
    """ 
    Specification of parameters a job expects as input
    """
    params: dict[str, ParameterSpecType]


class FileParameter(BaseModel):
    file_id: str


class ParameterSet(BaseModel):
    """
    Set of parameter values provided by a client for a job
    """
    params: dict[str, StrictInt | list[StrictInt] | StrictFloat | list[StrictFloat] | str | bool | FileParameter | list[FileParameter]]


class FileParameterResolved(BaseModel):
    file_path: str


class ParameterSetResolved(BaseModel):
    """
    Set of parameter values resolved to local files are ready to be used by a job
    """
    params: dict[str, StrictInt | list[StrictInt] | StrictFloat | list[StrictFloat] | str | bool |  FileParameterResolved | list[FileParameterResolved]]
