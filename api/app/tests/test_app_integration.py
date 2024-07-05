"""Test the integration of the mainline APIs together, ideal for CI"""

# pylint: disable=redefined-outer-name

import json
from http import HTTPStatus
from uuid import UUID

from munch import munchify

from routes.assets.assets import AssetVersionContent
from routes.type_adapters import register_adapters
from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import uploader
from tests.shared_test import get_random_string, assert_status_code, make_random_content

test_profile_name = "test-profile"
test_profile_full_name = "test-profile-full-name"
test_profile_description = "test-description"
test_profile_signature = 'X' * 32
test_profile_email = "test@test.com"
test_profile_tags = {"tag-a": "a", "tag-b": "b", "tag-c": "c"}
test_profile_href = "https://test.com/"
test_asset_name = 'test-asset'
test_asset_description = 'test-asset-description'
test_asset_collection_name = 'test-collection'
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"


# see localhost/docs for examples

def test_create_profile_and_assets(api_base, client, create_profile, uploader):
    register_adapters()
    test_profile = create_profile(name=test_profile_name,
                                  email=test_profile_email,
                                  full_name=test_profile_full_name,
                                  signature=test_profile_signature,
                                  description=test_profile_description,
                                  profile_href=test_profile_href)
    profile_id, token = test_profile.profile.id, test_profile.auth_token
    assert profile_id is not None

    headers = {
        'Authorization': f'Bearer {token}',
    }

    # validate email
    o = munchify(client.get(
        f"{api_base}/validate-email",
        headers=headers).json())
    assert UUID(o.owner) == profile_id
    assert len(o.link) > 0
    assert len(o.code) > 0
    assert o.state == 'link_sent'
    validate_code = o.code

    o = munchify(client.get(
        f"{api_base}/validate-email/{validate_code}",
        headers=headers).json())
    assert UUID(o.owner) == profile_id
    assert o.state == 'validated'

    # update the profile data
    o = munchify(client.post(
        f"{api_base}/profiles/{profile_id}",
        json={"name": test_profile_name + "-updated"},
        headers=headers).json())
    assert UUID(o.id) == profile_id
    assert o.name == test_profile_name + "-updated"

    # validate updated profile existence again
    o = munchify(client.get(f"{api_base}/profiles/{profile_id}").json())
    assert UUID(o.id) == profile_id
    assert o.name == test_profile_name + "-updated"

    # upload content, index FileUploadResponses to AssetVersionContent JSON entries
    # the AssetVersionContent is pre-serialized to JSON to remove issues with UUID conversion
    files = [make_random_content("hda") for _ in range(2)]
    response_files = uploader(profile_id, headers, files)
    asset_contents = list(map(
        lambda x: json.loads(AssetVersionContent(**x.model_dump()).model_dump_json()),
        response_files.values()))

    # create org to contain assets
    org_name = 'org-' + get_random_string(10, digits=False)
    r = client.post(
        f"{api_base}/orgs/",
        json={'name': org_name},
        headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert profile_id == UUID(o.admin.profile_id)
    org_id = UUID(o.org.id)

    # create asset in org
    o = munchify(client.post(
        f"{api_base}/assets",
        json={'org_id': str(org_id)},
        headers=headers).json())
    asset_id = UUID(o.id)

    # asset object returned, without version information
    r = client.get(
        f"{api_base}/assets/owned",
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 1
    o = munchify(r.json()[0])
    assert UUID(o.asset_id) == asset_id
    assert UUID(o.owner) == profile_id
    assert UUID(o.org_id) == org_id
    assert o.version == [0, 0, 0]
    assert o.package_id is None
    assert o.author is None
    assert o.name is None
    assert o.description is None
    assert o.created is None
    assert o.commit_ref is None
    assert not o.published

    # validate asset query at version 0.0.0
    r = client.get(
        f"{api_base}/assets/{asset_id}/versions/0.0.0",
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert UUID(o.asset_id) == asset_id
    assert UUID(o.owner) == profile_id
    assert UUID(o.org_id) == org_id
    assert o.version == [0, 0, 0]
    assert o.author is None
    assert o.name is None

    # add content to asset
    test_asset_ver_json = {
        'asset_id': str(asset_id),
        'commit_ref': test_commit_ref,
        'contents': {"files": asset_contents},
        'name': test_asset_name,
        'description': test_asset_description,
        'author': str(profile_id),
    }
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/0.1.0",
        json=test_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert UUID(o.asset_id) == asset_id
    assert UUID(o.org_id) == org_id
    assert o.name == test_asset_name
    assert o.version == [0, 1, 0]
    for f in o.contents['files']:
        assert f.file_id in response_files
        assert f.size == response_files[f.file_id].size
        assert len(f.content_hash) > 0

    # query asset versions
    r = client.get(f"{api_base}/assets/{asset_id}").json()
    assert len(r) == 1
    o = munchify(r[0])
    assert UUID(o.asset_id) == asset_id
    assert UUID(o.org_id) == org_id

    # create new asset version
    test_asset_ver_json = {
        'commit_ref': test_commit_ref + '-updated',
        'contents': {'files': asset_contents[1:]},
        'name': test_asset_name + '-updated',
        'author': str(profile_id),
    }
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/0.2.0",
        json=test_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert UUID(o.asset_id) == asset_id
    assert UUID(o.org_id) == org_id
    assert o.commit_ref == test_commit_ref + '-updated'
    assert o.name == test_asset_name + '-updated'
    assert o.version == [0, 2, 0]
    assert len(o.contents['files']) == 1

    # validate asset query at version 0.0.0, still returns empty version info
    r = client.get(
        f"{api_base}/assets/{asset_id}/versions/0.0.0",
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert UUID(o.asset_id) == asset_id
    assert UUID(o.owner) == profile_id
    assert UUID(o.org_id) == org_id
    assert o.version == [0, 0, 0]
    assert o.author is None
    assert o.name is None

    # query specific asset version
    o = munchify(client.get(f"{api_base}/assets/{asset_id}/versions/0.1.0").json())
    assert UUID(o.asset_id) == asset_id
    assert UUID(o.org_id) == org_id
    assert o.version == [0, 1, 0]

    o = munchify(client.get(f"{api_base}/assets/{asset_id}/versions/0.2.0").json())
    assert UUID(o.asset_id) == asset_id
    assert UUID(o.org_id) == org_id
    assert o.version == [0, 2, 0]
    assert o.name == test_asset_name + '-updated'
    assert len(o.contents['files']) == 1

    # test asset query by name
    r = client.get(f"{api_base}/assets/named/{test_asset_name}")
    assert_status_code(r, HTTPStatus.OK)
    items = r.json()
    assert len(items) > 0
    for i in items:
        o = munchify(i)
        assert o.asset_id is not None
        assert o.owner is not None
        assert o.author is not None
        assert o.org_id is not None
        assert o.name == test_asset_name
        assert o.version == [0, 1, 0]

    # test owned asset versions
    r = client.get(f"{api_base}/assets/owned", headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    results = r.json()
    assert len(results) == 2
    for r in results:
        o = munchify(r)
        assert UUID(o.asset_id) == asset_id
        assert UUID(o.owner) == profile_id
        assert UUID(o.author) == profile_id
        assert o.name is not None
        assert o.org_id is not None

    # query versions for asset, assert sort order of versions returned
    r = client.get(f"{api_base}/assets/{asset_id}").json()
    assert len(r) == 2
    r[0] = munchify(r[0])
    r[1] = munchify(r[1])
    assert UUID(r[0].asset_id) == asset_id
    assert UUID(r[1].asset_id) == asset_id
    assert UUID(r[0].org_id) == org_id
    assert UUID(r[1].org_id) == org_id
    assert r[0].version == [0, 2, 0]
    assert r[1].version == [0, 1, 0]

    # update existing asset version
    test_asset_ver_json = {
        'commit_ref': test_commit_ref + '-updated-2',
        'name': test_asset_name + '-updated-2',
        'contents': {'files': []},
        'author': str(profile_id),
    }
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/0.2.0",
        json=test_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o.commit_ref == test_commit_ref + '-updated-2'
    assert o.name == test_asset_name + '-updated-2'
    assert len(o.contents['files']) == 0


def test_invalid_profile_url(client, api_base):
    response = client.post(f"{api_base}/profiles",
                           json={
                               'name': test_profile_name,
                               'email': test_profile_email,
                               'full_name': test_profile_full_name,
                               'signature': test_profile_signature,
                               'description': test_profile_description,
                               'profile_base_href': "ht://whatever.com", })
    assert_status_code(response, HTTPStatus.UNPROCESSABLE_ENTITY)


def test_blank_profile_url(client, api_base):
    response = client.post(f"{api_base}/profiles",
                           json={
                               'name': test_profile_name,
                               'email': test_profile_email,
                               'full_name': test_profile_full_name,
                               'signature': test_profile_signature,
                               'description': test_profile_description})
    assert_status_code(response, HTTPStatus.CREATED)
