from typing import Optional, Literal
from uuid import uuid4

from pydantic import BaseModel


class IntParameter(BaseModel):
    type: Literal["Int"] = "Int"
    label: str
    min: Optional[int]
    max: Optional[int]
    default: int | list[int]


class FloatParameter(BaseModel):
    type: Literal["Float"] = "Float"
    label: str
    min: Optional[float]
    max: Optional[float]
    default: float | list[float]


class StringParameter(BaseModel):
    type: Literal["String"] = "String"
    label: str
    default: str


class BooleanParameter(BaseModel):
    type: Literal["Toggle"] = "Toggle"
    label: str
    default: bool


class ParameterSpec(BaseModel):
    inputs: list[str]
    params: dict[str, IntParameter | FloatParameter | StringParameter | BooleanParameter]