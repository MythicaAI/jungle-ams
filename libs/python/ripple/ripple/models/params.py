from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import Annotated, Literal, Optional, Union, Any

from uuid import uuid4


class ParameterSpecModel(BaseModel):
    param_type: str
    label: str
    category_label: str = None
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


class EnumValueSpec(BaseModel):
    name: str
    label: str


class EnumParameterSpec(ParameterSpecModel):
    param_type: Literal['enum'] = 'enum'
    values: list[EnumValueSpec]
    default: str


class FileParameterSpec(ParameterSpecModel):
    param_type: Literal['file'] = 'file'
    default: str | list[str]


ParameterSpecType = Annotated[
    Union[
        IntParameterSpec,
        FloatParameterSpec,
        StringParameterSpec,
        BoolParameterSpec,
        EnumParameterSpec,
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
    file_path: Optional[str] = None


ParameterType = (
    int,
    float,
    str,
    bool,
    FileParameter,
)

def _validate_parameter_types(values:dict, match_type) -> Any:
    def check(field,value):
        # For list-like, check each value
        if isinstance(value, (list, tuple, set, frozenset)):
            for item in value:
                check(field, item)
        # For Dicts, check if they are FileParams. Otherwise check each item        
        elif isinstance(value, dict):
            try:
                FileParameter(**value)
            except Exception:
                for key, item in value.items():
                    check(f"{field}:{key}", item)
        # If its not a "collection" value it must be of match_type            
        elif not isinstance(value, match_type):
            raise TypeError(f"Field '{field}' contains invalid type: {type(value)}. Must match {match_type}.")
        
    for field, value in values.items():
        check(field,value)
    return values

class ParameterSet(BaseModel):
    model_config = ConfigDict(extra='allow')
    # This root validator checks all fields' values
    @model_validator(mode='before')
    @classmethod
    def check_parameter_types(cls, values:dict) -> Any:
        return _validate_parameter_types(values, ParameterType)
    