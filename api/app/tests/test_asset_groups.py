"""Tests for grouping of assets under profiles"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

from munch import munchify

from tests.fixtures.create_asset_versions import create_asset_versions
from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import uploader
from tests.shared_test import assert_status_code


def test_asset_groups(client, api_base, create_profile, create_asset_versions, uploader):
    test_profile = create_profile(validate_email=True)
    asset_versions = create_asset_versions(
        test_profile,
        uploader,
        version_ids=['0.9.9', '1.0.0'])
    specific_versions = create_asset_versions(
        test_profile,
        uploader,
        version_ids=['0.0.1', '0.0.2', '0.0.3', '1.0.0', '0.1.0', '0.1.4'])

    highest_asset_version = sorted(asset_versions, key=lambda a: a.version)[-1]
    specific_version_0_0_1 = next((x for x in specific_versions if x.version == [0, 0, 1]), None)
    specific_version_0_0_2 = next((x for x in specific_versions if x.version == [0, 0, 2]), None)

    favorites = 'favorites'
    unreal = 'unreal'

    # validate 0 assets returned
    r = client.get(
        f"{api_base}/assets/g/{favorites}",
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.OK)
    assert (len(r.json()) == 0)

    # add a specific asset version to the 'favorites' group
    r = client.post(
        f"{api_base}/assets/g/{favorites}/{specific_version_0_0_2.asset_id}/versions/0.0.2",
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.CREATED)

    # add the latest version of asset_versions to the favorites group
    r = client.post(
        f"{api_base}/assets/g/{favorites}/{asset_versions[0].asset_id}/versions/0.0.0",
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.CREATED)

    # add the other version to the 'unreal' group
    r = client.post(
        f"{api_base}/assets/g/{unreal}/{specific_version_0_0_1.asset_id}/versions/0.0.1",
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.CREATED)

    # state is now 3 grouped assets, 2 in favorites, 1 in unreal - in the favorites group the latest
    # asset version should be returned

    # validate the favorites group
    r = client.get(
        f"{api_base}/assets/g/{favorites}",
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.OK)
    assert (len(r.json()) == 2)
    valid_favorite_assets = {specific_version_0_0_2.asset_id: specific_version_0_0_2.version,
                             highest_asset_version.asset_id: highest_asset_version.version}
    for avr in [munchify(x) for x in r.json()]:
        assert avr.asset_id in valid_favorite_assets.keys()
        assert valid_favorite_assets[avr.asset_id] == avr.version
        assert valid_favorite_assets[avr.asset_id] != [0, 0, 0]

    # validate the unreal group
    r = client.get(
        f"{api_base}/assets/g/{unreal}",
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.OK)
    assert (len(r.json()) == 1)
    valid_unreal_assets = {specific_version_0_0_1.asset_id: specific_version_0_0_1.version}
    for avr in [munchify(x) for x in r.json()]:
        assert avr.asset_id in valid_favorite_assets.keys()
        assert valid_unreal_assets[avr.asset_id] == avr.version
        assert valid_unreal_assets[avr.asset_id] != [0, 0, 0]

    # delete favorite asset version
    r = client.delete(
        f"{api_base}/assets/g/{favorites}/{asset_versions[0].asset_id}/versions/0.0.0",
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.OK)
    r = client.get(
        f"{api_base}/assets/g/{favorites}",
        headers=test_profile.authorization_header())
    assert_status_code(r, HTTPStatus.OK)
    assert (len(r.json()) == 1)
    assert not any([x['asset_id'] == asset_versions[0].asset_id for x in r.json()])
