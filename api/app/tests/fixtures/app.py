"""App's general pytest fixture"""

import pytest

from config import app_config


@pytest.fixture
def use_local_storage_fixture():
    """Override app's setting"""
    settings = app_config()
    original_settings = settings.model_copy()

    setattr(settings, "use_local_storage", True)

    yield settings

    # Restore the original settings
    settings.__dict__.update(original_settings.__dict__)
