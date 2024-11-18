# pylint: disable=redefined-outer-name, unused-import

import os
import tempfile

from ripple.compile.rpsc import compile_interface
from ripple.models.params import (
    ParameterSpec, 
    ParameterSet, 
    IntParameterSpec, 
    FloatParameterSpec, 
    StringParameterSpec, 
    BoolParameterSpec, 
    EnumValueSpec,
    EnumParameterSpec,
    FileParameterSpec, 
    FileParameter
)
from ripple.runtime.params import validate_params, resolve_params, repair_parameters


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
                "menu_items": ["0", "1", "2"],
                "menu_labels": ["A", "B", "C"],
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


def test_param_validate():
    # Minimal test
    spec = ParameterSpec(params={})
    set = ParameterSet()
    assert validate_params(spec, set)

    # All types test
    spec = ParameterSpec(params={
        'test_int': IntParameterSpec(label='test_int', default=0),
        'test_float': FloatParameterSpec(label='test_float', default=0.5),
        'test_str': StringParameterSpec(label='test_str', default=''),
        'test_bool': BoolParameterSpec(label='test_bool', default=True),
        'test_enum': EnumParameterSpec(label='test_enum', default='a', values=[EnumValueSpec(name='a', label='A')]),
        'test_file': FileParameterSpec(label='test_file', default='')
    })
    set = ParameterSet(
        test_int=5,
        test_float=1.5,
        test_str='test',
        test_bool=False,
        test_enum="a",
        test_file=FileParameter(file_id='file_qfJSVuWRJvq5PmueFPxSjXsEcST')
    )
    assert validate_params(spec, set)

    # Parameter count test
    spec = ParameterSpec(params={"input0": FileParameterSpec(label="Test Input 0", default='')})
    set_good = ParameterSet(input0= FileParameter(file_id="file_qfJSVuWRJvq5PmueFPxSjXsEcST"))
    set_bad = ParameterSet()
    assert validate_params(spec, set_good)
    assert validate_params(spec, set_bad) == False

    # Parameter type test
    spec = ParameterSpec(params={'test_int': IntParameterSpec(label='test', default=0)})
    set_good = ParameterSet(test_int= 5)
    set_bad = ParameterSet(test_int ='bad')
    assert validate_params(spec, set_good)
    assert validate_params(spec, set_bad) == False

    # Parameter array test
    spec = ParameterSpec(params={'test_int': IntParameterSpec(label='test', default=[1, 2, 3])})
    set_good = ParameterSet(test_int= [4, 5, 6])
    set_bad = ParameterSet(test_int= [1])
    set_bad2 = ParameterSet(test_int= ['a', 'b', 'c'])
    assert validate_params(spec, set_good)
    assert validate_params(spec, set_bad) == False
    assert validate_params(spec, set_bad2) == False

    # Enum test
    spec = ParameterSpec(params={'test_enum': EnumParameterSpec(label='test_enum', default='a', values=[EnumValueSpec(name='a', label='A')])})
    set_good = ParameterSet(test_enum="a")
    set_bad = ParameterSet(test_enum="b")
    assert validate_params(spec, set_good)
    assert validate_params(spec, set_bad) == False

    # Constant test
    spec = ParameterSpec(params={'test_int': IntParameterSpec(label='test', default=0, constant=True)})
    set_good = ParameterSet(test_int= 0)
    set_bad = ParameterSet(test_int= 1)
    assert validate_params(spec, set_good)
    assert validate_params(spec, set_bad) == False

    # Populate constants test
    spec = ParameterSpec(params={
        'test_int': IntParameterSpec(label='test_int', default=0, constant=True),
        'test_file': FileParameterSpec(label='test_file', default='file_qfJSVuWRJvq5PmueFPxSjXsEcST', constant=True),
    })
    set = ParameterSet()
    assert validate_params(spec, set) == False
    repair_parameters(spec, set)
    assert validate_params(spec, set)

    # Implicit int to float cast test
    spec = ParameterSpec(params={
        'test_float': FloatParameterSpec(label='test', default=0.0),
        'test_float_array': FloatParameterSpec(label='test', default=[0.0, 0.0, 0.0])
    })
    set = ParameterSet(test_float=5, test_float_array=[1, 2, 3])
    assert validate_params(spec, set) == False
    repair_parameters(spec, set)
    assert validate_params(spec, set)


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
            FileParameter(file_id="file_3qH7tzKgQFqXiPqJnW7cuR6WwbFB"),
            FileParameter(file_id="file_3qH7tzKgQFqXiPqJnW7cuR6WwbFB")
        ])
        success = resolve_params(endpoint, tmp_dir, set)
        assert success
        assert isinstance(set.files, list)
        assert isinstance(set.files[0], FileParameter)
        assert isinstance(set.files[1], FileParameter)
        assert set.files[0].file_id == "file_3qH7tzKgQFqXiPqJnW7cuR6WwbFB"
        assert set.files[1].file_id == "file_3qH7tzKgQFqXiPqJnW7cuR6WwbFB"
        assert set.files[0].file_path.startswith('file_') == False
        assert set.files[1].file_path.startswith('file_') == False
        assert os.path.exists(set.files[0].file_path)
        assert os.path.exists(set.files[1].file_path)
    """
