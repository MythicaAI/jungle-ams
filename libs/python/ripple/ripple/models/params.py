from itertools import starmap

from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import Annotated, Literal, Optional, Union, Any
from ripple.models  import houTypes as hou
from uuid import uuid4
import typing


class ParameterSpecModel(BaseModel):
    param_type: str
    label: str
    category_label: Optional[str] = None
    constant: bool = False

class RampPointSpec(BaseModel):
    pos: float
    c: Optional[list[float]] = None
    value: Optional[float] = None
    interp: hou.rampBasis = hou.rampBasis.Linear

class RampColorPointSpec(BaseModel):
    pos: float
    c: list[float] = []
    interp: hou.rampBasis = hou.rampBasis.Linear

class RampValuePointSpec(BaseModel):
    pos: float
    value: float = 0.0
    interp: hou.rampBasis = hou.rampBasis.Linear

####################################################################################################
# Standard Parameter Specs
####################################################################################################
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


class RampParameterSpec(ParameterSpecModel):
    param_type: Literal['ramp'] = 'ramp'
    ramp_parm_type: hou.rampParmType = hou.rampParmType.Float
    default: list[RampPointSpec]

class EnumParameterSpec(ParameterSpecModel):
    param_type: Literal['enum'] = 'enum'
    values: list[EnumValueSpec]
    default: str


class FileParameterSpec(ParameterSpecModel):
    param_type: Literal['file'] = 'file'
    name: Optional[str] = ""
    type: Optional[list[str]] = None
    default: str | list[str]


####################################################################################################
# Houdini Parameter Specs
####################################################################################################

class ParmTemplateSpec(ParameterSpecModel):
    param_type: Literal['base'] = 'base'
    name: str
    is_hidden: bool = False
    is_label_hidden: bool = False
    help: str = ""
    join_with_next: bool = False
    #### Fields below for future use
    #conditionals: dict[hou.parmCondType, str] = {}
    #script_callback: str = ""
    #script_callback_language: hou.scriptLanguage = hou.scriptLanguage.Hscript
    #tab_conditionals: dict[hou.parmCondType, str] = {}
    #tags: dict[str, str] = {}
    #disable_when: str = ""
    #default_expression: list[str] = []
    #default_expression_language: list[hou.scriptLanguage] = []

class SeparatorParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Separator] = hou.parmTemplateType.Separator

class ButtonParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Button] = hou.parmTemplateType.Button

class IntParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Int] = hou.parmTemplateType.Int
    num_components: int = 1
    default_value: list[int]
    min: int = 0
    max: int = 10
    min_is_strict: bool = False
    max_is_strict: bool = False

class FloatParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Float] = hou.parmTemplateType.Float
    num_components: int = 1
    default_value: list[float]
    min: float = 0.0
    max: float = 10.0
    min_is_strict: bool = False
    max_is_strict: bool = False

class StringParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.String] = hou.parmTemplateType.String
    num_components: int = 1
    default_value: list[str] = []
    string_type: hou.stringParmType = hou.stringParmType.Regular
    file_type: hou.fileType = hou.fileType.Any
    icon_names: list[str] = []
    menu_items: list[str] = []
    menu_labels: list[str] = []
    menu_type: hou.menuType = hou.menuType.Normal

class ToggleParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Toggle] = hou.parmTemplateType.Toggle
    default_value: bool = False

class MenuParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Menu] = hou.parmTemplateType.Menu
    default_value: int = 0
    menu_items: list[str] = []
    menu_labels: list[str] = []
    menu_type: hou.menuType = hou.menuType.Normal
    store_default_value_as_string: bool = False    
    is_menu: bool = False
    is_button_strip: bool = False
    strip_uses_icons: bool = False
    menu_use_token: bool = False
    

class LabelParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Label] = hou.parmTemplateType.Label
    column_labels: list[str] = []


class RampParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Ramp] = hou.parmTemplateType.Ramp
    ramp_parm_type: hou.rampParmType = hou.rampParmType.Float
    default_value: int = 2
    default_basis: Optional[hou.rampBasis] = hou.rampBasis.Linear
    color_type: Optional[hou.colorType] = hou.colorType.RGB
    default_points: list[RampPointSpec] = []
    
class DataParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Data] = hou.parmTemplateType.Data
    num_components: int = 1


class FolderParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.Folder] = hou.parmTemplateType.Folder
    level: int = 0
    parm_templates: list["HoudiniParmTemplateSpecType"] = []
    folder_type: hou.folderType = hou.folderType.Tabs
    default_value: int = 0
    ends_tab_group: bool = False

class FolderSetParmTemplateSpec(ParmTemplateSpec):
    param_type: Literal[hou.parmTemplateType.FolderSet] = hou.parmTemplateType.FolderSet
    parm_templates: list[FolderParmTemplateSpec] = []

HoudiniParmTemplateSpecType = Annotated[
    Union[
        SeparatorParmTemplateSpec,
        ButtonParmTemplateSpec,
        IntParmTemplateSpec,
        FloatParmTemplateSpec,
        StringParmTemplateSpec,
        ToggleParmTemplateSpec,
        MenuParmTemplateSpec,
        LabelParmTemplateSpec,
        RampParmTemplateSpec,
        DataParmTemplateSpec,
        FolderParmTemplateSpec,
        FolderSetParmTemplateSpec,
        FileParameterSpec,
    ],
    Field(discriminator='param_type')
]


ParameterSpecType = Annotated[
    Union[
        IntParameterSpec,
        FloatParameterSpec,
        StringParameterSpec,
        BoolParameterSpec,
        EnumParameterSpec,
        FileParameterSpec,
        RampParameterSpec,
        HoudiniParmTemplateSpecType
    ],
    Field(discriminator='param_type')
]


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

def _get_parameter_spec(values: dict) -> list[HoudiniParmTemplateSpecType]:
    """
    Based on the type of parameter, generate the appropriate HoudiniParmTemplateSpec.
    If the parameter is a (list/tuple/set/frozenset) of values, make sure we set the numComponents
    to the number of values in the list and then generate the appropriate HoudiniParmTemplateSpec
    based on the type of the first value in the list.
    """
    specs = []
    for key, value in values.items():
        # Check if it's a generic type (like list[int], tuple[str], etc.)
        if hasattr(value, "__origin__") and value.__origin__ in (list, tuple, set, frozenset):
            # Get the type argument (e.g., int from list[int])
            arg_type = value.__args__[0] if hasattr(value, "__args__") and value.__args__ else Any
            my_length = len(value.__args__) if hasattr(value, "__args__") else 0
            # Handle based on the contained type
            if arg_type == int:
                specs.append(IntParmTemplateSpec(name=key, label=key, num_components=my_length, default_value=[0 for _ in range(my_length)]))
            elif arg_type == float:
                specs.append(FloatParmTemplateSpec(name=key, label=key, num_components=my_length, default_value=[0.0 for _ in range(my_length)]))
            elif arg_type == str:
                specs.append(StringParmTemplateSpec(name=key, label=key, num_components=my_length, default_value=["" for _ in range(my_length)]))
            elif arg_type == FileParameter:
                specs.append(FileParameterSpec(name=key, label=key, default=[]))
            else:
                raise ValueError(f"Unsupported parameter type for '{key}': list/tuple/set of {arg_type}")
        # Check simple types
        elif value == int:
            specs.append(IntParmTemplateSpec(name=key, label=key, default_value=[0]))
        elif value == float:
            specs.append(FloatParmTemplateSpec(name=key, label=key, default_value=[0.0]))
        elif value == str:
            specs.append(StringParmTemplateSpec(name=key, label=key, default_value=[""]))
        elif value == bool:
            specs.append(ToggleParmTemplateSpec(name=key, label=key))
        elif value == FileParameter:
            specs.append(FileParameterSpec(name=key, label=key, default=""))
        else:
            raise ValueError(f"Unsupported parameter type for '{key}': {value}")
    return specs


def _validate_parameter_types(values:dict, match_type) -> Any:
    def check(field, value):
        # For list-like, check each value
        if isinstance(value, (list, tuple, set, frozenset)):
            for item in value:
                check(field, item)
        # For Dicts, check if they are FileParams. Otherwise, check each item
        elif isinstance(value, dict):
            try:
                FileParameter(**value)
            except Exception:
                for key, item in value.items():
                    check(f"{field}:{key}", item)
        # If it's not a "collection" value it must be of match_type
        elif not isinstance(value, match_type):
            raise TypeError(f"Field '{field}' contains invalid type: {type(value)}. Must match {match_type}.")
        
    starmap(check, values.items())

    return values

class ParameterSet(BaseModel):
    model_config = ConfigDict(extra='allow')
    @classmethod
    def get_parameter_specs(cls) -> list[HoudiniParmTemplateSpecType]:
        # Get the model's fields with their default values
        values = {
            field_name: field.annotation 
            for field_name, field in cls.model_fields.items()
            if field.annotation is not None
        }
        return _get_parameter_spec(values)

    # This root validator checks all fields' values
    @model_validator(mode='before')
    @classmethod
    def check_parameter_types(cls, values:dict) -> Any:
        return _validate_parameter_types(values, ParameterType)
    
class ParameterSpec(BaseModel):
    """ 
    Specification of parameters a job expects as input
    """
    params: dict[str, ParameterSpecType]
    params_v2: Optional[list[HoudiniParmTemplateSpecType]] = []
    default: Optional[ParameterSet] = {}
    hidden: Optional[dict[str, bool]] = {}
