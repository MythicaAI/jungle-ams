# pylint: disable=redefined-outer-name, unused-import
import pytest
import tempfile

from ripple.compile.rpsc import compile_interface
from ripple.models.houTypes import rampParmType, rampBasis
from ripple.models.params import (
    ParameterSpec,
    ParameterSet,
    IntParameterSpec,
    FloatParameterSpec,
    ParameterSpecModel,
    RampParameterSpec, StringParameterSpec,
    BoolParameterSpec,
    EnumValueSpec,
    EnumParameterSpec,
    FileParameterSpec,
    FileParameter,
)
from ripple.runtime.params import validate_param, validate_params, resolve_params, repair_parameters, ParamError


class UnknownTestType:
    def __init__(self):
        self.value = "a type to trigger an error"


def assert_validation(e: ParamError, contents: str):
    assert type(e) is ParamError
    assert contents in str(e), f"{contents} not in {str(e)}"


def test_param_compile():
    # Minimal test
    data = """
    {
        "defaults": {},
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert compiled.params == {}

    # Int test
    data = """
    {
        "defaults": {
            "test_int": {
                "type": "Int",
                "label": "Test Int",
                "default": 5
            },
            "test_int_array": {
                "type": "Int",
                "label": "Test Int",
                "default": [1, 2, 3]
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 2
    assert isinstance(compiled.params['test_int'], IntParameterSpec)
    assert compiled.params['test_int'].default == 5
    assert isinstance(compiled.params['test_int_array'], IntParameterSpec)
    assert compiled.params['test_int_array'].default == [1, 2, 3]

    # Float test
    data = """
    {
        "defaults": {
            "test_float": {
                "type": "Float",
                "label": "Test Float",
                "default": 3.14
            },
            "test_float_array": {
                "type": "Float",
                "label": "Test Float Array",
                "default": [1.1, 2.2, 3.3]
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 2
    assert isinstance(compiled.params['test_float'], FloatParameterSpec)
    assert compiled.params['test_float'].default == 3.14
    assert isinstance(compiled.params['test_float_array'], FloatParameterSpec)
    assert compiled.params['test_float_array'].default == [1.1, 2.2, 3.3]

    # String test
    data = """
    {
        "defaults": {
            "test_string": {
                "type": "String",
                "label": "Test String",
                "default": "Hello World"
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 1
    assert isinstance(compiled.params['test_string'], StringParameterSpec)
    assert compiled.params['test_string'].default == "Hello World"

    # Boolean test
    data = """
    {
        "defaults": {
            "test_toggle": {
                "type": "Toggle",
                "label": "Test Toggle",
                "default": true
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 1
    assert isinstance(compiled.params['test_toggle'], BoolParameterSpec)
    assert compiled.params['test_toggle'].default is True

    # Menu enum test
    data = """
    {
        "defaults": {
            "test_enum": {
                "type": "Menu",
                "label": "Test Enum",
                "menu_items": ["", "", ""],
                "menu_labels": ["A", "B", "C"],
                "menu_use_tokens": false,
                "default": 0
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 1
    assert isinstance(compiled.params['test_enum'], EnumParameterSpec)
    assert len(compiled.params['test_enum'].values) == 3
    assert compiled.params['test_enum'].values[0].name == "0"
    assert compiled.params['test_enum'].values[0].label == "A"
    assert compiled.params['test_enum'].default == "0"

    # String enum test
    data = """
    {
        "defaults": {
            "test_enum": {
                "type": "String",
                "label": "Test Enum",
                "menu_items": ["a", "b", "c"],
                "menu_labels": ["A", "B", "C"],
                "default": "a"
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 1
    assert isinstance(compiled.params['test_enum'], EnumParameterSpec)
    assert len(compiled.params['test_enum'].values) == 3
    assert compiled.params['test_enum'].values[0].name == "a"
    assert compiled.params['test_enum'].values[0].label == "A"
    assert compiled.params['test_enum'].default == "a"

    # Int enum test
    data = """
    {
        "defaults": {
            "test_enum": {
                "type": "Int",
                "label": "Test Enum",
                "menu_items": ["", "", ""],
                "menu_labels": ["A", "B", "C"],
                "menu_use_tokens": false,
                "default": 0
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 1
    assert isinstance(compiled.params['test_enum'], EnumParameterSpec)
    assert len(compiled.params['test_enum'].values) == 3
    assert compiled.params['test_enum'].values[0].name == "0"
    assert compiled.params['test_enum'].values[0].label == "A"
    assert compiled.params['test_enum'].default == "0"

    # Bad enum default test
    data = """
    {
        "defaults": {
            "test_enum": {
                "type": "String",
                "label": "Test Enum",
                "menu_items": ["a", "b", "c"],
                "menu_labels": ["A", "B", "C"],
                "default": "bad"
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 1
    assert isinstance(compiled.params['test_enum'], EnumParameterSpec)
    assert len(compiled.params['test_enum'].values) == 3
    assert compiled.params['test_enum'].values[0].name == "a"
    assert compiled.params['test_enum'].values[0].label == "A"
    assert compiled.params['test_enum'].default == "a"

    # Empty enum test
    data = """
    {
        "defaults": {
            "test_enum": {
                "type": "Menu",
                "label": "Test Enum",
                "default": 0
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 0

    # File test
    data = """
    {
        "defaults": {},
        "inputLabels": [
            "Test Input 0",
            "Test Input 1"
        ]
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 2
    assert isinstance(compiled.params['input0'], FileParameterSpec)
    assert compiled.params['input0'].label == "Test Input 0"
    assert isinstance(compiled.params['input1'], FileParameterSpec)
    assert compiled.params['input1'].label == "Test Input 1"


    # Invalid type test
    data = """
    {
        "defaults": {
            "test_invalid": {
                "type": "InvalidType",
                "label": "Test Invalid",
                "default": 123
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 0

    # Category test
    data = """
    {
        "defaults": {
            "category_toggle": {
                "type": "Toggle",
                "label": "Test Toggle 1",
                "folder": "folder_name",
                "folder_label": "Folder Name",
                "default": true
            },
            "no_category_toggle": {
                "type": "Toggle",
                "label": "Test Toggle 2",
                "default": true
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 2
    assert compiled.params['category_toggle'].category_label == "Folder Name"
    assert compiled.params['no_category_toggle'].category_label is None


def test_menu_params():
    data = """
    {
        "defaults": {
            "menu_no": {
                "type": "Menu",
                "label": "Label",
                "menu_items": ["", "", ""],
                "menu_labels": ["A", "B", "C"],
                "menu_use_tokens": false,
                "default": 0
            },
            "menu_yes": {
                "type": "Menu",
                "label": "Label",
                "menu_items": ["4", "", "1"],
                "menu_labels": ["A", "B", "C"],
                "menu_use_tokens": true,
                "default": 0
            },
            "int_no": {
                "type": "Int",
                "label": "Label",
                "menu_items": ["", "", ""],
                "menu_labels": ["A", "B", "C"],
                "menu_use_tokens": false,
                "default": 0
            },
            "int_yes": {
                "type": "Int",
                "label": "Label",
                "menu_items": ["4", "abc", "1"],
                "menu_labels": ["A", "B", "C"],
                "menu_use_tokens": true,
                "default": 0
            },
            "string": {
                "type": "String",
                "label": "Label",
                "menu_items": ["a", "b", ""],
                "menu_labels": ["A", "B", "C"],
                "default": "a"
            }
        },
        "inputLabels": []
    }"""
    compiled = compile_interface(data)
    assert len(compiled.params) == 5

    for param in compiled.params.values():
        assert isinstance(param, EnumParameterSpec)
        assert param.default in (value.name for value in param.values)

    assert compiled.params["menu_no"].values[0].name == "0"
    assert compiled.params["menu_no"].values[1].name == "1"
    assert compiled.params["menu_no"].values[2].name == "2"

    assert compiled.params["menu_yes"].values[0].name == "4"
    assert compiled.params["menu_yes"].values[1].name == "1"
    assert compiled.params["menu_yes"].values[2].name == "1"

    assert compiled.params["int_no"].values[0].name == "0"
    assert compiled.params["int_no"].values[1].name == "1"
    assert compiled.params["int_no"].values[2].name == "2"

    assert compiled.params["int_yes"].values[0].name == "4"
    assert compiled.params["int_yes"].values[1].name == "1"
    assert compiled.params["int_yes"].values[2].name == "1"

    assert compiled.params["string"].values[0].name == "a"
    assert compiled.params["string"].values[1].name == "b"
    assert compiled.params["string"].values[2].name == ""


def test_param_validate_minimal():
    # Minimal test
    spec = ParameterSpec(params={})
    set = ParameterSet()
    validate_params(spec, set)


def test_param_validation_all_types():
    # All types test
    spec = ParameterSpec(params={
        'test_int': IntParameterSpec(label='test_int', default=0),
        'test_float': FloatParameterSpec(label='test_float', default=0.5),
        'test_str': StringParameterSpec(label='test_str', default=''),
        'test_bool': BoolParameterSpec(label='test_bool', default=True),
        'test_enum': EnumParameterSpec(label='test_enum', default='a', values=[EnumValueSpec(name='a', label='A')]),
        'test_file': FileParameterSpec(label='test_file', default=''),
        'test_ramp_float': RampParameterSpec(
            label='test_ramp_value', 
            ramp_parm_type=rampParmType.Float,
            default=[{'pos': 0.0, 'value': 0.0, 'interp': rampBasis.Linear}]),
        'test_ramp_color': RampParameterSpec(
            label='test_ramp_color', 
            ramp_parm_type=rampParmType.Color,
            default=[{'pos': 0.0, 'c': [1.0, 1.0, 1.0], 'interp': rampBasis.Linear}]),
    })
    set = ParameterSet(
        test_int=5,
        test_float=1.5,
        test_str='test',
        test_bool=False,
        test_enum="a",
        test_file=FileParameter(file_id='file_qfJSVuWRJvq5PmueFPxSjXsEcST'),
        test_ramp_float=[{'pos': 0.0, 'value': 0.0, 'interp': rampBasis.Linear}, {'pos': 1.0, 'value': 1.0, 'interp': rampBasis.Linear}],
        test_ramp_color=[{'pos': 0.0, 'c': [1.0, 1.0, 1.0], 'interp': rampBasis.Linear}, {'pos': 1.0, 'c': [0.0, 0.0, 0.0], 'interp': rampBasis.Linear}],
    )
    validate_params(spec, set)


def test_param_validation_count():
    # Parameter count test
    spec = ParameterSpec(params={"input0": FileParameterSpec(label="Test Input 0", default='')})
    set_good = ParameterSet(input0= FileParameter(file_id="file_qfJSVuWRJvq5PmueFPxSjXsEcST"))
    set_bad = ParameterSet()
    validate_params(spec, set_good)
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad)
    assert_validation(exc_info.value, "param not provided")

def test_param_validation_type_mismatch():
    # Parameter type test
    spec = ParameterSpec(params={'test_int': IntParameterSpec(label='test', default=0)})
    set_good = ParameterSet(test_int=5)
    set_bad = ParameterSet(test_int='bad')
    validate_params(spec, set_good)
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad)
    assert_validation(exc_info.value, "did not match expected type")

def test_param_validation_ramp():
    spec = ParameterSpec(params={
        'test_ramp': RampParameterSpec(
            label='test', 
            ramp_parm_type=rampParmType.Float, 
            default=[{'pos': 0.0, 'value': 0.0, 'interp': rampBasis.Linear}])})
    set_bad_outer = ParameterSet(test_ramp={'pos': 0.0, 'value': 0.0, 'interp': rampBasis.Linear})
    set_bad_inner = ParameterSet(test_ramp=[0.0, 1.0])
    set_bad_miss_pos = ParameterSet(test_ramp=[{'value': 0.0, 'interp': rampBasis.Linear}, {'pos': 1.0, 'value': 1.0, 'interp': rampBasis.Linear}])
    set_bad_miss_value = ParameterSet(test_ramp=[{'pos': 0.0, 'interp': rampBasis.Linear}, {'pos': 1.0, 'value': 1.0, 'interp': rampBasis.Linear}])
    set_bad_miss_interp = ParameterSet(test_ramp=[{'pos': 0.0, 'value': 0.0}, {'pos': 1.0, 'value': 1.0, 'interp': rampBasis.Linear}])
    
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_outer)
    assert_validation(exc_info.value, "ramp params must be list of dict")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_inner)
    assert_validation(exc_info.value, "ramp point must be of type dict")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_miss_pos)
    assert_validation(exc_info.value, "ramp point must contain 'pos' and 'value|c' and 'interp' keys")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_miss_value)
    assert_validation(exc_info.value, "ramp point must contain 'pos' and 'value|c' and 'interp' keys")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_miss_interp)
    assert_validation(exc_info.value, "ramp point must contain 'pos' and 'value|c' and 'interp' keys")

def test_param_conversion_ramp():
    specVal = ParameterSpec(params={
        'test_ramp': RampParameterSpec(
            label='test', 
            ramp_parm_type=rampParmType.Float, 
            default=[{'pos': 0.0, 'value': 0.0, 'interp': rampBasis.Linear}])})
    specColor = ParameterSpec(params={
        'test_ramp': RampParameterSpec(
            label='test', 
            ramp_parm_type=rampParmType.Color, 
            default=[{'pos': 0.0, 'c': [0.0,0.0,0.0], 'interp': rampBasis.Linear}])})
    set_good_pos = ParameterSet(test_ramp=[{'pos': 0, 'value': 0.0, 'interp': rampBasis.Linear}, {'pos': 1, 'value': 1.0, 'interp': rampBasis.Linear}])    
    set_good_val = ParameterSet(test_ramp=[{'pos': 0.0, 'value': 0, 'interp': rampBasis.Linear}, {'pos': 1.0, 'value': 1, 'interp': rampBasis.Linear}])    
    set_good_col = ParameterSet(test_ramp=[{'pos': 0.0, 'c': [0,0,0], 'interp': rampBasis.Linear}, {'pos': 1.0, 'c': [1,1,1], 'interp': rampBasis.Linear}])    
    repair_parameters(specVal, set_good_pos)
    validate_params(specVal, set_good_pos)
    repair_parameters(specVal, set_good_val)
    validate_params(specVal, set_good_val)
    repair_parameters(specColor, set_good_col)
    validate_params(specColor, set_good_col)

def test_param_validation_ramp_float():
    # Ramp float test
    spec = ParameterSpec(params={
        'test_ramp': RampParameterSpec(
            label='test', 
            ramp_parm_type=rampParmType.Float, 
            default=[{'pos': 0.0, 'value': 0.0, 'interp': rampBasis.Linear}])})
    set_good = ParameterSet(test_ramp=[{'pos': 0.0, 'value': 0.0, 'interp': rampBasis.Linear}, {'pos': 1.0, 'value': 1.0, 'interp': rampBasis.Linear}])
    set_bad_pos = ParameterSet(test_ramp=[{'pos': 'd', 'value': 0.0, 'interp': rampBasis.Linear}, {'pos': 'd', 'value': 0.0, 'interp': rampBasis.Linear}])
    set_bad_value = ParameterSet(test_ramp=[{'pos': 0.0, 'value': 'f', 'interp': rampBasis.Linear}, {'pos': 1.0, 'value': 'bad', 'interp': rampBasis.Linear}])
    set_bad_interp = ParameterSet(test_ramp=[{'pos': 0.0, 'value': 0.0, 'interp': 'foo'}, {'pos': 1.0, 'value': 0.0, 'interp': 'foo'}])
    validate_params(spec, set_good)
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_pos)
    assert_validation(exc_info.value, "ramp point 'pos' must be of type float")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_value)
    assert_validation(exc_info.value, "ramp point 'value' must be of type float")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_interp)
    assert_validation(exc_info.value, "ramp point 'interp' must be a valid value from hou.rampBasis")

def test_param_validation_ramp_color():
    #Ramp color test
    spec = ParameterSpec(params={
        'test_ramp': RampParameterSpec(
            label='test',
            ramp_parm_type=rampParmType.Color,
            default=[{'pos': 0.0, 'c': [1.0, 1.0, 1.0], 'interp': rampBasis.Linear}])})
    set_good = ParameterSet(test_ramp=[{'pos': 0.0, 'c': [1.0, 1.0, 1.0], 'interp': rampBasis.Linear}, {'pos': 1.0, 'c': [0.0, 0.0, 0.0], 'interp': rampBasis.Linear}])
    set_bad_pos = ParameterSet(test_ramp=[{'pos': 'd', 'c': [1.0, 1.0, 1.0], 'interp': rampBasis.Linear}, {'pos': 'd', 'c': [1.0, 1.0, 1.0], 'interp': rampBasis.Linear}])
    set_bad_c_outer = ParameterSet(test_ramp=[{'pos': 0.0, 'c': 'f', 'interp': rampBasis.Linear}, {'pos': 1.0, 'c': 'bad', 'interp': rampBasis.Linear}])
    set_bad_c_inner_type = ParameterSet(test_ramp=[{'pos': 0.0, 'c': ['d','d','d'], 'interp': rampBasis.Linear}, {'pos': 1.0, 'c': ['d','d','d'], 'interp': rampBasis.Linear}])
    set_bad_c_inner_count = ParameterSet(test_ramp=[{'pos': 0.0, 'c': [0.0, 0.0], 'interp': rampBasis.Linear}, {'pos': 1.0, 'c': [0.0, 0.0], 'interp': rampBasis.Linear}])    
    set_bad_interp = ParameterSet(test_ramp=[{'pos': 0.0, 'c': [1.0, 1.0, 1.0], 'interp': 'foo'}, {'pos': 1.0, 'c': [0.0, 0.0, 0.0], 'interp': 'foo'}])
    validate_params(spec, set_good)
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_pos)
    assert_validation(exc_info.value, "ramp point 'pos' must be of type float")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_c_outer)
    assert_validation(exc_info.value, "ramp point color 'c' must be of type list")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_c_inner_type)
    assert_validation(exc_info.value, "ramp point color 'c' must be of type list of floats")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_c_inner_count)
    assert_validation(exc_info.value, "ramp point color 'c' must be of length 3")
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad_interp)
    assert_validation(exc_info.value, "ramp point 'interp' must be a valid value from hou.rampBasis")

def test_param_validation_booleans():
    # Bool parameter test
    spec = ParameterSpec(params={'test_bool': BoolParameterSpec(label='test', default=True)})
    set_good = ParameterSet(test_bool=False)
    set_bad = ParameterSet(test_bool='bad')
    validate_params(spec, set_good)
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad)
    assert_validation(exc_info.value, "did not match expected type")

def test_param_validation_strings():
    # String parameter test
    spec = ParameterSpec(params={'test_str': StringParameterSpec(label='test', default='a')})
    set_good = ParameterSet(test_str='b')
    set_bad = ParameterSet(test_str=0)
    validate_params(spec, set_good)
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad)
    assert_validation(exc_info.value, "did not match expected type")


def test_param_validation_unknown_types():
    unknown_spec = IntParameterSpec(label='test', default=0)
    with pytest.raises(ParamError) as exc_info:
        validate_param(unknown_spec, 0, None)
    assert_validation(exc_info.value, "invalid type validation")


def test_param_validation_arrays():
    # Parameter array test
    spec = ParameterSpec(params={'test_int': IntParameterSpec(label='test', default=[1, 2, 3])})
    set_good = ParameterSet(test_int=[4, 5, 6])
    validate_params(spec, set_good)

    set_bad = ParameterSet(test_int=[1])
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad)
    assert_validation(exc_info.value, "length mismatch")

    set_bad2 = ParameterSet(test_int=['a', 'b', 'c'])
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad2)
    assert_validation(exc_info.value, "did not match expected type")

    # TODO-jrepp: this currently does not fail
    #set_bad3 = ParameterSet(test_int=0)
    #with pytest.raises(ParamError) as exc_info:
    #    validate_params(spec, set_bad3)
    #assert_validation(exc_info.value, "did not match expected type")


def test_param_validation_enums():
    # Enum test
    spec = ParameterSpec(params={'test_enum': EnumParameterSpec(label='test_enum', default='a', values=[EnumValueSpec(name='a', label='A')])})
    set_good = ParameterSet(test_enum="a")
    set_bad = ParameterSet(test_enum="b")
    validate_params(spec, set_good)
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad)
    assert_validation(exc_info.value, "not in")

def test_param_validation_constants():
    # Constant test
    spec = ParameterSpec(params={'test_int': IntParameterSpec(label='test', default=0, constant=True)})
    set_good = ParameterSet(test_int=0)
    set_bad = ParameterSet(test_int=1)
    validate_params(spec, set_good)
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set_bad)
    assert_validation(exc_info.value, "constant mismatch")

    # Populate constants test
    spec = ParameterSpec(params={
        'test_int': IntParameterSpec(label='test_int', default=0, constant=True),
        'test_file': FileParameterSpec(label='test_file', default='file_qfJSVuWRJvq5PmueFPxSjXsEcST', constant=True),
        'test_file_array': FileParameterSpec(label='test_file_array', default=['file_qfJSVuWRJvq5PmueFPxSjXsEcST'], constant=True),
    })
    set = ParameterSet()
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set)
    assert_validation(exc_info.value, "param not provided")
    repair_parameters(spec, set)
    validate_params(spec, set)

    # validate constant length mismatch
    with pytest.raises(ParamError) as exc_info:
        set_invalid_length = ParameterSet(
            test_int=0,
            test_file=FileParameter(file_id='file_qfJSVuWRJvq5PmueFPxSjXsEcST'),
            test_file_array=[]
        )
        validate_params(spec, set_invalid_length)
    assert_validation(exc_info.value, "length mismatch")

    # validate invalid type in array param, this invalidates underlying model
    # construction of expectedType(**)
    with pytest.raises(TypeError):
        set_invalid_type = ParameterSet(
            test_int=0,
            test_file=FileParameter(file_id='file_qfJSVuWRJvq5PmueFPxSjXsEcST'),
            test_file_array=[UnknownTestType()])
        validate_params(spec, set_invalid_type)


def test_param_implicit_cast_to_float():
    # Implicit int to float cast test
    spec = ParameterSpec(params={
        'test_float': FloatParameterSpec(label='test', default=0.0),
        'test_float_array': FloatParameterSpec(label='test_array', default=[0.0, 0.0, 0.0])
    })
    set = ParameterSet(test_float=5, test_float_array=[1, 2, 3])
    with pytest.raises(ParamError) as exc_info:
        validate_params(spec, set)
    assert_validation(exc_info.value, "did not match expected type")
    repair_parameters(spec, set)
    validate_params(spec, set)


def test_param_resolve():
    # Identity test
    with tempfile.TemporaryDirectory() as tmp_dir:
        set = ParameterSet(test_int=5)
        success = resolve_params("", tmp_dir, set)
        assert success
        assert isinstance(set.test_int, int)
        assert set.test_int == 5

    """
    #TODO: Setup endpoint that works in test environment
    endpoint = "https://api.mythica.ai/v1"

    # File test
    with tempfile.TemporaryDirectory() as tmp_dir:
        set = ParameterSet(input0=FileParameter(file_id="file_3qH7tzKgQFqXiPqJnW7cuR6WwbFB"))
        success = resolve_params(endpoint, tmp_dir, set)
        assert success
        assert isinstance(set.input0, FileParameter)
        assert set.input0.file_id == "file_3qH7tzKgQFqXiPqJnW7cuR6WwbFB"
        assert set.input0.file_path.startswith('file_') == False
        assert os.path.exists(set.input0.file_path)

    # File list test
    with tempfile.TemporaryDirectory() as tmp_dir:
        set = ParameterSet(files=[
            FileParameter(file_id="file_3vJPfGBtqaEsKisjDiivDBf7N2jc"),
            FileParameter(file_id="file_3EH5RVbKaEHEdK3t2EufqbsM6CE7")
        ])
        success = resolve_params(endpoint, tmp_dir, set)
        assert success
        assert isinstance(set.files, list)
        assert isinstance(set.files[0], FileParameter)
        assert isinstance(set.files[1], FileParameter)
        assert set.files[0].file_id == "file_3vJPfGBtqaEsKisjDiivDBf7N2jc"
        assert set.files[1].file_id == "file_3EH5RVbKaEHEdK3t2EufqbsM6CE7"
        assert set.files[0].file_path.startswith('file_') == False
        assert set.files[1].file_path.startswith('file_') == False
        assert os.path.exists(set.files[0].file_path)
        assert os.path.exists(set.files[1].file_path)
        assert set.files[0].file_path != set.files[1].file_path
    """