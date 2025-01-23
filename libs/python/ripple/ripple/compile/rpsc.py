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


def parse_index_menu_parameter(value: dict) -> EnumParameterSpec:
    values = []

    assert len(value['menu_items']) == len(value['menu_labels'])
    for index in range(len(value['menu_items'])):
        item = value['menu_items'][index]
        label = value['menu_labels'][index]

        name = str(index)
        if value['menu_use_tokens'] and item.isdigit():
            name = item

        values.append(EnumValueSpec(name=name, label=label))

    default = str(value['default'])
    if default not in (v.name for v in values):
        default = values[0].name
    return EnumParameterSpec(values=values, default=default, label=value['label'])


def parse_string_menu_parameter(value: dict) -> EnumParameterSpec:
    values = [EnumValueSpec(name=name, label=label) for name, label in zip(value['menu_items'], value['menu_labels'])]

    default = str(value['default'])
    if default not in (v.name for v in values):
        default = values[0].name
    return EnumParameterSpec(values=values, default=default, label=value['label'])


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
            if 'menu_items' in value and 'menu_labels' in value:
                param = parse_index_menu_parameter(value)
            else:
                param = IntParameterSpec(**value)
        elif value['type'] == 'Float':
            param = FloatParameterSpec(**value)
        elif value['type'] == 'String':
            if 'menu_items' in value and 'menu_labels' in value:
                param = parse_string_menu_parameter(value)
            else:
                param = StringParameterSpec(**value)
        elif value['type'] == 'Toggle':
            param = BoolParameterSpec(**value)
        elif value['type'] == 'Menu':
            if 'menu_items' in value and 'menu_labels' in value:
                param = parse_index_menu_parameter(value)
            else:
                continue
        else:
            continue

        if 'folder_label' in value:
            param.category_label = value['folder_label']

        params[name] = param

    return ParameterSpec(params=params)