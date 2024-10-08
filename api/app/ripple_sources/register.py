from ripple.source_types import add_source_type
from ripple_sources.events_table import create_events_table_source


def register_streaming_sources():
    """
    Register all internal streaming sources, this is done
    to provide an overridable name->source factory map for the
    readers endpoint
    """
    add_source_type('events', create_events_table_source)
