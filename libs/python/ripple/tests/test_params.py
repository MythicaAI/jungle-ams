# pylint: disable=redefined-outer-name, unused-import

import os

from ripple.compile.rpsc import compile_interface
from ripple.models.params import ParameterSpec, ParameterSet, ParameterSetResolved, IntParameterSpec, FloatParameterSpec, StringParameterSpec, BoolParameterSpec
from ripple.runtime.params import validate_params, resolve_params


def test_param_compile():
    # Minimal test
    data = """
    {
        "defaults": {},
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert compiled.inputs == []
    assert compiled.params == {}

    # Inputs test
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
    assert len(compiled.inputs) == 2
    assert compiled.inputs[0] == "Test Input 0"
    assert compiled.inputs[1] == "Test Input 1"

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


def test_param_validate():
    # Minimal test
    spec = ParameterSpec(inputs=[], params={})
    set = ParameterSet(inputs=[], params={})
    assert validate_params(spec, set)

    # Input test
    spec = ParameterSpec(inputs=["Test Input 0"], params={})
    set_good = ParameterSet(inputs=["file_qfJSVuWRJvq5PmueFPxSjXsEcST"], params={})
    set_bad = ParameterSet(inputs=[], params={})
    assert validate_params(spec, set_good)
    assert validate_params(spec, set_bad) == False

    # Good input test
    spec = ParameterSpec(inputs=[], params={'test_int': {'label': 'test', 'default': 0}})
    set_good = ParameterSet(inputs=[], params={'test_int': 5})
    set_bad = ParameterSet(inputs=[], params={'test_int': 'bad'})
    assert validate_params(spec, set_good)
    assert validate_params(spec, set_bad) == False


def test_param_resolve():
    # File test
    set = ParameterSet(inputs=['file_qfJSVuWRJvq5PmueFPxSjXsEcST'], params={})
    result = resolve_params(set)
    assert result is not None
    assert len(result.inputs) == 1
    #assert os.path.exists(result.inputs[0])
