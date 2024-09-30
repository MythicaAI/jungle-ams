"""
Ripple Param Spec Compiler.

Converts interface files or other inputs into param specs
that can be executed by a runtime.
"""
import json
from ripple.models.params import ParameterSpec

def compile_interface(interface_data: str) -> ParameterSpec:
    """
    Compile an interface file into a parameter spec.
    """
    data = json.loads(interface_data)
    print(data)

    inputs = data['inputLabels']
    params = {}
    return ParameterSpec(inputs=inputs, params=params)