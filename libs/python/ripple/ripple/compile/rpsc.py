"""
Ripple Param Spec Compiler.

Converts interface files or other inputs into param specs
that can be executed by a runtime.
"""
import json

from ripple.models.params import ParameterSpec, IntParameterSpec, FloatParameterSpec, StringParameterSpec, BoolParameterSpec, FileParameterSpec


def compile_interface(interface_data: str) -> ParameterSpec:
    """
    Compiles a Houdini interface file into a parameter spec.
    """
    data = json.loads(interface_data)

    params = {}

    for index, name in enumerate(data['inputLabels']):
        params[f'input{index}'] = FileParameterSpec(label=name, default='')
    
    for name, value in data['defaults'].items():
        if value['type'] == 'Int':
            param = IntParameterSpec(**value)
        elif value['type'] == 'Float':
            param = FloatParameterSpec(**value)
        elif value['type'] == 'String':
            param = StringParameterSpec(**value)
        elif value['type'] == 'Toggle':
            param = BoolParameterSpec(**value)
        else:
            continue

        params[name] = param

    return ParameterSpec(params=params)