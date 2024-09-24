"""App's general pytest fixture"""
from typing import Any

import pytest

from config import app_config
from streaming.funcs import Source
from streaming.models import StreamItem
from streaming.source_types import add_source_type, remove_source_type
from streaming.sources.memory import create_memory_source


@pytest.fixture
def use_local_storage_fixture():
    """Override app's setting"""
    settings = app_config()
    original_settings = settings.model_copy()

    setattr(settings, "use_local_storage", True)

    yield settings

    # Restore the original settings
    settings.__dict__.update(original_settings.__dict__)


"""A list of named streams that are populated for the fixture"""  # pylint: disable=W0105:pointless-string-statement
_test_streams: dict[str, list[StreamItem]] = {}


def create_test_source(params: dict[str, Any]) -> Source:
    """Create a test source we items loaded from a named cached list"""
    name = params.get('name')
    items: list[StreamItem] = _test_streams.get(name, [])
    return create_memory_source(items, params)


@pytest.fixture
def use_test_source_fixture():
    """Provide a registered test source while this fixture is used"""
    add_source_type("test", create_test_source)
    _test_streams.clear()
    yield _test_streams
    remove_source_type("test")
