# pylint: disable=redefined-outer-name, unused-import
import json

from ripple.compile.rpsc import compile_interface

test_data_file = './tests/test_data/test_interface.json'

def test_param_compile():
    # Minimal test
    data = """
    {
        "inputs": 0,
        "params": {},
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
        "params": {},
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

    """
    # Load test data
    test_data = None
    with open(test_data_file, 'r') as f:
        test_data = json.load(f)

    # Convert test data to a string
    compiled = compile_interface(test_data)
    """
    assert True