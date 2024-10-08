# pylint: disable=W0105:pointless-string-statement

from typing import Any

from ripple.funcs import Source, SourceFactory

"""
Map source types by name to the source type callables
"""
_source_types: dict[str, SourceFactory] = {}


def add_source_type(source_type: str, source_fn: SourceFactory):
    """Register a source type function to a name that allows the creation of sources"""
    assert source_type not in _source_types
    _source_types[source_type] = source_fn


def remove_source_type(source_type: str):
    """Remove a source type registration"""
    assert source_type in _source_types
    del _source_types[source_type]


def create_source(source_type: str, params: dict[str, Any]) -> Source:
    """Create a new source with a set of parameters"""
    fn = _source_types.get(source_type)
    if fn is None:
        raise ValueError(f'unknown source type {source_type}')
    return fn(params)
