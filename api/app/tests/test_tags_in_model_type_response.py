# pylint: disable=redefined-outer-name, unused-import

import hashlib
import itertools
from http import HTTPStatus
import json

from munch import munchify

from assets.assets_repo import AssetVersionContent

from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code, get_random_string, make_random_content
from tests.fixtures.uploader import uploader

test_event_info_len = 10
next_test_event_id = itertools.count(start=1, step=1)

test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_hash = hashlib.sha1(test_file_contents).hexdigest()
test_file_content_type = "application/octet-stream"


def test_tags_in_assets_responses(api_base, client, create_profile, uploader):
    test_profile = create_profile(email="test@mythica.ai")
    profile = test_profile.profile
    headers = test_profile.authorization_header()
    profile_id = test_profile.profile.profile_id

    # create org to contain assets
    org_name = 'org-' + get_random_string(10, digits=False)
    r = client.post(f"{api_base}/orgs/", json={'name': org_name}, headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    org_id = o.org_id

    def create_asset(headers):
        # create asset in org
        r = client.post(f"{api_base}/assets", json={'org_id': org_id}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        return o.asset_id

    asset_id = create_asset(headers)

    top_limit = 5

    def create_tag():
        # create tag
        tag_name = "tag_" + get_random_string(10, digits=False)
        r = client.post(f"{api_base}/tags", json={'name': tag_name}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        assert o.name == tag_name
        assert o.owner_id == profile.profile_id
        tag_id = o.tag_id
        return tag_id, tag_name

    def create_type_tag(type_model_name, type_id, tag_id):
        # create tag for type_model
        r = client.post(
            f"{api_base}/tags/types/{type_model_name}",
            json={'tag_id': tag_id, "type_id": type_id},
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        assert o.tag_id == tag_id
        assert o.type_id == type_id
        return tag_id, tag_name

    created_tag_ids = []
    for _ in range(top_limit):
        tag_id, tag_name = create_tag()
        created_tag_ids.append(tag_id)
        create_type_tag("asset", asset_id, tag_id)

    files = [make_random_content("hda") for _ in range(2)]
    response_files = uploader(profile_id, headers, files)
    asset_contents = list(
        map(
            lambda x: json.loads(
                AssetVersionContent(**x.model_dump()).model_dump_json()
            ),
            response_files.values(),
        )
    )
    # create new asset version
    asset_version_name = "-updated"
    asset_ver_commit_ref = asset_version_name
    test_asset_ver_json = {
        'commit_ref': asset_ver_commit_ref,
        'contents': {'files': asset_contents[1:]},
        'name': asset_version_name,
        'author_id': profile_id,
        'published': True,
    }
    version_str = "0.2.0"
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/{version_str}",
        json=test_asset_ver_json,
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    for tag_id in created_tag_ids:
        assert tag_id in [tag["tag_id"] for tag in o.tags]
    package_file = [make_random_content("zip") for _ in range(1)]
    uri = f"/upload/package/{asset_id}/{version_str}"
    response_files = uploader(profile_id, headers, package_file, uri)

    r = client.get(
        f"{api_base}/assets/all",
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert len(o)
    assert "tags" in o[0].keys()
    for response_asset in o:
        if response_asset.tags and response_asset.asset_id == asset_id:
            for tag_id in created_tag_ids:
                assert tag_id in [tag["tag_id"] for tag in response_asset.tags]

    r = client.get(f"{api_base}/assets/{asset_id}/versions/0.2.0")
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())

    for tag_id in created_tag_ids:
        assert tag_id in [tag["tag_id"] for tag in o.tags]

    r = client.get(f"{api_base}/assets/{asset_id}")
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert "tags" in o[0].keys()
    for response_asset in o:
        if response_asset.tags and response_asset.asset_id == asset_id:
            for tag_id in created_tag_ids:
                assert tag_id in [tag["tag_id"] for tag in response_asset.tags]

    r = client.get(f"{api_base}/assets/named/{asset_version_name}")
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o[0].tags
    assert "tags" in o[0].keys()
    for response_asset in o:
        if response_asset.tags and response_asset.asset_id == asset_id:
            for tag_id in created_tag_ids:
                assert tag_id in [tag["tag_id"] for tag in response_asset.tags]

    r = client.get(f"{api_base}/assets/top")
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert "tags" in o[0].keys()
    for response_asset in o:
        if response_asset.tags and response_asset.asset_id == asset_id:
            for tag_id in created_tag_ids:
                assert tag_id in [tag["tag_id"] for tag in response_asset.tags]

    r = client.get(
        f"{api_base}/assets/committed_at",
        params={"ref": asset_ver_commit_ref},
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert "tags" in o[0].keys()
    for response_asset in o:
        if response_asset.tags and response_asset.asset_id == asset_id:
            for tag_id in created_tag_ids:
                assert tag_id in [tag["tag_id"] for tag in response_asset.tags]
