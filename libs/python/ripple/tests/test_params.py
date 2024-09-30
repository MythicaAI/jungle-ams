# pylint: disable=redefined-outer-name, unused-import

from ripple.compile.rpsc import compile_interface

def test_param_compile():
    # Minimal test
    data = """
    {
        "inputs": 0,
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
        "inputs": 2,
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
        "inputs": 0,
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
    assert compiled.params['test_int'].type == "Int"
    assert compiled.params['test_int'].default == 5
    assert compiled.params['test_int_array'].type == "Int"
    assert compiled.params['test_int_array'].default == [1, 2, 3]

    # Float test
    data = """
    {
        "inputs": 0,
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
    assert compiled.params['test_float'].type == "Float"
    assert compiled.params['test_float'].default == 3.14
    assert compiled.params['test_float_array'].type == "Float"
    assert compiled.params['test_float_array'].default == [1.1, 2.2, 3.3]

    # String test
    data = """
    {
        "inputs": 0,
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
    assert compiled.params['test_string'].type == "String"
    assert compiled.params['test_string'].default == "Hello World"

    # Boolean test
    data = """
    {
        "inputs": 0,
        "defaults": {
            "test_toggle_true": {
                "type": "Toggle",
                "label": "Test Toggle True",
                "default": true
            }
        },
        "inputLabels": []
    }
    """
    compiled = compile_interface(data)
    assert len(compiled.params) == 1
    assert compiled.params['test_toggle_true'].type == "Toggle"
    assert compiled.params['test_toggle_true'].default is True

    # Invalid type test
    data = """
    {
        "inputs": 0,
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
