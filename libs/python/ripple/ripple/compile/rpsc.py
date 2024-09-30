"""
Ripple Param Spec Compiler.

Converts interface files or other inputs into param specs
that can be executed by a runtime.
"""
import json
from ripple.models.params import ParameterSpec, IntParameter, FloatParameter, StringParameter, BooleanParameter

def compile_interface(interface_data: str) -> ParameterSpec:
    """
    Compile an interface file into a parameter spec.
    """
    data = json.loads(interface_data)

    inputs = data['inputLabels']
    params = {}
    
    for name,value in data['defaults'].items():
        if value['type'] == 'Int':
            param = IntParameter(**value)
        elif value['type'] == 'Float':
            param = FloatParameter(**value)
        elif value['type'] == 'String':
            param = StringParameter(**value)
        elif value['type'] == 'Toggle':
            param = BooleanParameter(**value)
        else:
            continue

        params[name] = param

    return ParameterSpec(inputs=inputs, params=params)