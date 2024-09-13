"""App's general pytest fixture"""
from typing import Any

import pytest

from config import app_config
from streaming.funcs import Source
from streaming.models import StreamItem
from streaming.source_types import add_source_type, remove_source_type


@pytest.fixture
def use_local_storage_fixture():
    """Override app's setting"""
    settings = app_config()
    original_settings = settings.model_copy()

    setattr(settings, "use_local_storage", True)

    yield settings

    # Restore the original settings
    settings.__dict__.update(original_settings.__dict__)


"""A list of named streams that are populated for the fixture"""
_test_streams: dict[str, list[StreamItem]] = {}


class TestSource:
    """A test source takes a set of params that are the actual items to return"""

    def __init__(self, params: dict[str, Any]):
        name = params.get('name')
        assert name in _test_streams
        self.items: list[StreamItem] = _test_streams.get(name, [])
        self.max_page_size = params.get("max_page_size", 1)
        self.position = 0

    def __call__(self, position: str, max_page: int) -> list[StreamItem]:
        pos = int(position) if position else 0
        sub_items = self.items[pos:pos + max(max_page, self.max_page_size)]
        return sub_items

    @staticmethod
    def create(params: dict[str, Any]) -> Source:
        """Factory method"""
        return TestSource(params)


@pytest.fixture
def use_test_source_fixture():
    """Provide a registered test source while this fixture is used"""
    add_source_type("test", TestSource.create)
    _test_streams.clear()
    yield _test_streams
    remove_source_type("test")
