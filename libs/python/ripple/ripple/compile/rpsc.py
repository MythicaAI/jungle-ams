"""
Ripple Param Spec Compiler.

Converts interface files or other inputs into param specs
that can be executed by a runtime.
"""
import json

from ripple.models.params import (
    ParameterSpec, 
    IntParameterSpec, 
    FloatParameterSpec, 
    StringParameterSpec, 
    BoolParameterSpec,
    EnumValueSpec,
    EnumParameterSpec,
    FileParameterSpec
)


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
        elif value['type'] == 'Menu':
            assert len(value['menu_items']) == len(value['menu_labels'])
            values = [EnumValueSpec(name=name, label=label) for name, label in zip(value['menu_items'], value['menu_labels'])]
            default = values[value['default']].name
            param = EnumParameterSpec(values=values, default=default, label=value['label'])
        else:
            continue

        params[name] = param

    return ParameterSpec(params=params)