"""
Ripple Param Spec Compiler.

Converts interface files or other inputs into param specs
that can be executed by a runtime.
"""
import json

from ripple.models.params import ParameterSpec, IntParameterSpec, FloatParameterSpec, StringParameterSpec, BooleanParameterSpec


def compile_interface(interface_data: str) -> ParameterSpec:
    """
    Compiles a Houdini interface file into a parameter spec.
    """
    data = json.loads(interface_data)

    inputs = data['inputLabels']
    params = {}
    
    for name,value in data['defaults'].items():
        if value['type'] == 'Int':
            param = IntParameterSpec(**value)
        elif value['type'] == 'Float':
            param = FloatParameterSpec(**value)
        elif value['type'] == 'String':
            param = StringParameterSpec(**value)
        elif value['type'] == 'Toggle':
            param = BooleanParameterSpec(**value)
        else:
            continue

        params[name] = param

    return ParameterSpec(inputs=inputs, params=params)