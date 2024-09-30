"""
Ripple Param Spec Compiler.

Converts interface files or other inputs into param specs
that can be executed by a runtime.
"""

from ripple.models.params import ParameterSpec

def compile_interface(interface_data: str) -> ParameterSpec:
    """
    Compile an interface file into a parameter spec.
    """
    return ParameterSpec(inputs=[], params={})