# pylint: disable=redefined-outer-name, unused-import

import json
from http import HTTPStatus

import pytest
from munch import munchify

from assets.repo import AssetDependency, AssetFileReference, AssetVersionResult, \
    DEPENDENCIES_CONTENT_KEY, \
    FILES_CONTENT_KEY, \
    LINKS_CONTENT_KEY, THUMBNAILS_CONTENT_KEY
from tests.shared_test import ProfileTestObj, assert_status_code, make_random_content, random_str

default_versions = ['1.0.0']


@pytest.fixture(scope='module')
def create_asset_versions(client, api_base):
    def _create_asset_versions(
            test_profile: ProfileTestObj,
            uploader,
            name: str = "asset-name-" + random_str(10),
            description: str = "asset description" + random_str(100),
            published: bool = True,
            asset_id: str = None,
            version_ids: list[str] = None,
            commit_ref: str = random_str(8),
            attach_package: bool = True,
            dependencies: list[tuple[str, tuple[int, ...]]] = None) -> list[AssetVersionResult]:
        # upload content, index FileUploadResponses to AssetVersionContent JSON entries
        # the AssetVersionContent is pre-serialized to JSON to remove issues with ID conversion
        hdas = [make_random_content("hda") for _ in range(2)]
        thumbnail = make_random_content("png")
        headers = test_profile.authorization_header()
        hda_response_files = uploader(test_profile.profile.profile_id, headers, hdas)
        thumbnail_response_files = uploader(test_profile.profile.profile_id, headers, [thumbnail])

        hda_files = list(map(
            lambda x: json.loads(AssetFileReference(**x.model_dump()).model_dump_json()),
            hda_response_files.values()))
        thumbnail_files = list(map(
            lambda x: json.loads(AssetFileReference(**x.model_dump()).model_dump_json()),
            thumbnail_response_files.values()))
        links = ["https://test.com/link", "https://test.com/link2"]
        dependencies = list(map(
            lambda x: json.loads(AssetDependency(asset_id=x[0], version=x[1]).model_dump_json()),
            dependencies or []))

        # create the base asset if not provided
        if not asset_id:
            r = client.post(f"{api_base}/assets", headers=headers, json={})
            assert_status_code(r, HTTPStatus.CREATED)
            o = munchify(r.json())
            assert 'asset_id' in o
            asset_id = o.asset_id
        assert asset_id is not None

        if version_ids is None:
            version_ids = default_versions

        asset_versions = []
        for version_id in version_ids:
            version_body = {
                'name': name,
                'description': description + " testing version " + version_id,
                'published': published,
                'commit_ref': commit_ref,
                'contents': {
                    FILES_CONTENT_KEY: hda_files,
                    THUMBNAILS_CONTENT_KEY: thumbnail_files,
                    LINKS_CONTENT_KEY: links,
                    DEPENDENCIES_CONTENT_KEY: dependencies
                }
            }
            r = client.post(f"{api_base}/assets/{asset_id}/versions/{version_id}",
                            headers=headers,
                            json=version_body)
            assert_status_code(r, HTTPStatus.CREATED)

            package_id = None
            if attach_package:
                package = make_random_content("zip")
                package_response_files = uploader(
                    test_profile.profile.profile_id,
                    headers,
                    [package],
                    storage_uri=f"/upload/package/{asset_id}/{version_id}")
                assert len(package_response_files) == 1
                for file_id, _ in package_response_files.items():
                    package_id = file_id

            avr = AssetVersionResult(**r.json())
            avr.package_id = package_id
            asset_versions.append(avr)
        return asset_versions

    return _create_asset_versions
