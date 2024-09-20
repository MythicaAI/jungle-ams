from streaming.source_types import add_source_type
from streaming.sources.events_table import create_events_table_source


def register_streaming_sources():
    """Register all internal streaming sources"""
    add_source_type('events', create_events_table_source)
