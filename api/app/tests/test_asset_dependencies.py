# pylint: disable=redefined-outer-name, unused-import

from tests.fixtures.create_asset import create_asset
from tests.fixtures.create_profile import create_profile


def test_asset_dependencies(client, api_base, create_profile, create_asset):
    test_profile = create_profile()
    simple_asset = create_asset(
        test_profile)
    assert simple_asset is not None
    assert simple_asset.author_id == test_profile.profile.profile_id
    assert simple_asset.contents
    assert 'files' in simple_asset.contents
    assert len(simple_asset.contents['files']) > 0
    assert 'links' in simple_asset.contents
    assert len(simple_asset.contents['files']) > 0
    assert 'thumbnails' in simple_asset.contents
    assert len(simple_asset.contents['files']) > 0
