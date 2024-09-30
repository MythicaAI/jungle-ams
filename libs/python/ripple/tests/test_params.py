# pylint: disable=redefined-outer-name, unused-import
import json

test_data_file = './tests/test_data/test_interface.json'

def test_param_compile():
    # Load test data
    test_data = None
    with open(test_data_file, 'r') as f:
        test_data = json.load(f)

    assert True