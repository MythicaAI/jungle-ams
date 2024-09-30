from ripple.models.params import ParameterSpec, ParameterSet, ParameterSetResolved, IntParameterSpec, FloatParameterSpec, StringParameterSpec, BooleanParameterSpec


def validate_params(paramSpec: ParameterSpec, paramSet: ParameterSet) -> bool:
    if len(paramSpec.inputs) != len(paramSet.inputs):
        return False
    
    for name, value in paramSpec.params.items():
        if name not in paramSet.params:
            return False
        
        if isinstance(value, IntParameterSpec):
            if not isinstance(paramSet.params[name], int):
                return False        
        elif isinstance(value, FloatParameterSpec):
            if not isinstance(paramSet.params[name], float):
                return False
        elif isinstance(value, StringParameterSpec):
            if not isinstance(paramSet.params[name], str):
                return False
        elif isinstance(value, BooleanParameterSpec):
            if not isinstance(paramSet.params[name], bool):
                return False
        else:
            return False

    return True


def resolve_params(paramSet: ParameterSet) -> ParameterSetResolved:
    return True
