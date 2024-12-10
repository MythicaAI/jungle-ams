"""Test the integration of the mainline APIs together, ideal for CI"""

# pylint: disable=redefined-outer-name, unused-import

import json
from http import HTTPStatus

from fastapi.testclient import TestClient
from munch import munchify

from assets.repo import AssetFileReference
from routes.type_adapters import register_adapters
from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import uploader
from tests.shared_test import assert_status_code, make_random_content, random_str, refresh_auth_token

test_profile_name = "test-profile"
test_profile_full_name = "test-profile-full-name"
test_profile_description = "test-description"
test_profile_signature = 'X' * 32
test_profile_email = "test@mythica.ai"
test_profile_tags = {"tag-a": "a", "tag-b": "b", "tag-c": "c"}
test_profile_href = "https://test.com/"
test_asset_name = 'test-asset'
test_asset_description = 'test-asset-description'
test_asset_collection_name = 'test-collection'
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"


# see http://localhost:8080/docs for examples

def test_create_profile_and_assets(api_base, client: TestClient, create_profile, uploader):
    register_adapters()
    test_profile = create_profile(name=test_profile_name,
                                  email=test_profile_email,
                                  full_name=test_profile_full_name,
                                  signature=test_profile_signature,
                                  description=test_profile_description,
                                  profile_href=test_profile_href,
                                  validate_email=True)
    profile_id = test_profile.profile.profile_id
    assert profile_id is not None

    # get the bearer token authorization header
    headers = test_profile.authorization_header()

    # update the profile data
    o = munchify(client.post(
        f"{api_base}/profiles/{profile_id}",
        json={"name": test_profile_name + "-updated"},
        headers=headers).json())
    assert o.profile_id == profile_id
    assert o.name == test_profile_name + "-updated"

    # validate updated profile existence again
    o = munchify(client.get(f"{api_base}/profiles/{profile_id}").json())
    assert o.profile_id == profile_id
    assert o.name == test_profile_name + "-updated"

    # upload content, index FileUploadResponses to AssetVersionContent JSON entries
    # the AssetVersionContent is pre-serialized to JSON to remove issues with ID conversion
    files = [make_random_content("hda") for _ in range(2)]
    response_files = uploader(profile_id, headers, files)
    asset_contents = list(map(
        lambda x: json.loads(AssetFileReference(**x.model_dump()).model_dump_json()),
        response_files.values()))

    # create org to contain assets
    org_name = 'org-' + random_str(10, digits=False)
    r = client.post(
        f"{api_base}/orgs/",
        json={'name': org_name},
        headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert profile_id == o.profile_id
    org_id = o.org_id

    # after creating the org, refresh the auth token to get the new roles
    test_profile.auth_token = refresh_auth_token(client, api_base, test_profile)
    headers = test_profile.authorization_header()

    # create asset in org
    r = client.post(
        f"{api_base}/assets",
        json={'org_id': org_id},
        headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    asset_id = o.asset_id

    # asset object returned, without version information
    r = client.get(
        f"{api_base}/assets/owned",
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 1
    o = munchify(r.json()[0])
    assert o.asset_id == asset_id
    assert o.owner_id == profile_id
    assert o.org_id == org_id
    assert o.version == [0, 0, 0]
    assert o.author_id is None
    assert o.package_id is None
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
    assert o.asset_id == asset_id
    assert o.owner_id == profile_id
    assert o.org_id == org_id
    assert o.version == [0, 0, 0]
    assert o.author_id is None
    assert o.name is None

    # add content to asset
    test_asset_ver_json = {
        'asset_id': asset_id,
        'commit_ref': test_commit_ref,
        'contents': {"files": asset_contents},
        'name': test_asset_name,
        'description': test_asset_description,
        'author_id': profile_id,
    }
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/0.1.0",
        json=test_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o.asset_id == asset_id
    assert o.org_id == org_id
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
    assert o.asset_id == asset_id
    assert o.org_id == org_id

    # create new asset version
    test_asset_ver_json = {
        'commit_ref': test_commit_ref + '-updated',
        'contents': {'files': asset_contents[1:]},
        'name': test_asset_name + '-updated',
        'author_id': profile_id,
    }
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/0.2.0",
        json=test_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o.asset_id == asset_id
    assert o.org_id == org_id
    assert o.commit_ref == test_commit_ref + '-updated'
    assert o.name == test_asset_name + '-updated'
    assert o.version == [0, 2, 0]
    assert len(o.contents['files']) == 1

    # validate that invalid files fail
    test_asset_ver_json['contents']['files'] = [{'file_id': 'file_foo', 'file_name': 'foo'}]
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/0.2.0",
        json=test_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # validate that invalid links fail
    test_asset_ver_json['contents']['files'] = asset_contents[1:]
    test_asset_ver_json['contents']['links'] = ['foo']
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/0.2.0",
        json=test_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # fix up the asset
    test_asset_ver_json['contents']['links'] = ['https://valid.com']
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/0.2.0",
        json=test_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)

    # validate asset query at version 0.0.0, still returns empty version info
    r = client.get(
        f"{api_base}/assets/{asset_id}/versions/0.0.0",
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o.asset_id == asset_id
    assert o.owner_id == profile_id
    assert o.org_id == org_id
    assert o.version == [0, 0, 0]
    assert o.author_id is None
    assert o.name is None

    # query specific asset version
    o = munchify(client.get(f"{api_base}/assets/{asset_id}/versions/0.1.0").json())
    assert o.asset_id == asset_id
    assert o.org_id == org_id
    assert o.version == [0, 1, 0]

    o = munchify(client.get(f"{api_base}/assets/{asset_id}/versions/0.2.0").json())
    assert o.asset_id == asset_id
    assert o.org_id == org_id
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
        assert o.owner_id is not None
        assert o.author_id is not None
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
        assert o.asset_id == asset_id
        assert o.owner_id == profile_id
        assert o.author_id == profile_id
        assert o.name is not None
        assert o.org_id is not None

    # query versions for asset, assert sort order of versions returned
    r = client.get(f"{api_base}/assets/{asset_id}").json()
    assert len(r) == 2
    r[0] = munchify(r[0])
    r[1] = munchify(r[1])
    assert r[0].asset_id == asset_id
    assert r[1].asset_id == asset_id
    assert r[0].org_id == org_id
    assert r[1].org_id == org_id
    assert r[0].version == [0, 2, 0]
    assert r[1].version == [0, 1, 0]

    # populate 10 more versions to test top coalesce
    for i in range(10):
        test_asset_ver_json['published'] = True
        version_str = '.'.join(map(str, [1, i, 0]))
        test_asset_ver_json['commit_ref'] = test_commit_ref + '-' + version_str
        r = client.post(
            f"{api_base}/assets/{asset_id}/versions/{version_str}",
            json=test_asset_ver_json,
            headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)

        # create a package for each so they are available via the main index
        package_file = [make_random_content("zip") for _ in range(1)]
        uri = f"/upload/package/{asset_id}/{version_str}"
        response_files = uploader(profile_id, headers, package_file, uri)
        assert len(response_files) == 1

    # query versions for top, assert versions combined into one result
    r = client.get(f"{api_base}/assets/top")
    assert_status_code(r, HTTPStatus.OK)
    results = r.json()
    assert len(results) > 0
    count_found = 0
    for r in results:
        o = munchify(r)
        if o.asset_id != asset_id:
            continue
        count_found += 1
        commit_ref: str = str(o.commit_ref)
        assert 'versions' in o
        assert 'version' in o
        assert len(o.versions) == 4  # limit on versions returned
        assert o.version == [1, 9, 0]  # latest version
        assert o.versions[0] == [1, 9, 0]
        assert commit_ref.endswith("1.9.0")
        assert [1, 8, 0] in o.versions
        assert [1, 7, 0] in o.versions
        assert [1, 6, 0] in o.versions
    assert count_found == 1

    # update existing asset version
    test_link_update1 = "https://test.test/foo"
    test_link_update2 = "https://test.test/bar"
    test_asset_ver_json = {
        'commit_ref': test_commit_ref + '-updated-2',
        'name': test_asset_name + '-updated-2',
        'contents': {'files': [],
                     'links': [test_link_update1, test_link_update2]},
        'author_id': profile_id,
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

    new_profile = create_profile(name="new_profile",
                                 email="test_test@gmail.com",
                                 full_name=test_profile_full_name,
                                 signature=test_profile_signature,
                                 description=test_profile_description,
                                 profile_href=test_profile_href,
                                 validate_email=True)
    new_profile_id = new_profile.profile.profile_id
    new_headers = new_profile.authorization_header()

    # Test: Attempt to change author_id in an asset-version not owned by the user
    test_asset_ver_json.update(
        {'author_id': new_profile_id}
    )
    r = client.post(
        f"{api_base}/assets/{asset_id}/versions/0.2.0",
        json=test_asset_ver_json,
        headers=new_headers)
    assert_status_code(r, HTTPStatus.UNAUTHORIZED)
    o = munchify(r.json())
    assert f"not satisfied" in o.detail

    # create org to for new_profile
    r = client.post(
        f"{api_base}/orgs/",
        json={'name': 'org-' + random_str(10, digits=False)},
        headers=new_headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    new_profile_org_id = o.org_id

    # after creating the org, refresh the auth token to get the new roles
    new_profile.auth_token = refresh_auth_token(client, api_base, new_profile)
    new_headers = new_profile.authorization_header()

    # create asset for new_profile
    r = client.post(
        f"{api_base}/assets",
        json={'org_id': new_profile_org_id},
        headers=new_headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    new_profile_asset_id = o.asset_id

    new_profile_asset_ver_json = {
        'commit_ref': 'test_commit_ref-updated-2',
        'name': 'new_profile_asset_ver_json',
        'contents': {'files': [],
                     'links': [test_link_update1, test_link_update2]},
        'author_id': new_profile_id,
    }
    r = client.post(
        f"{api_base}/assets/{new_profile_asset_id}/versions/0.2.0",
        json=new_profile_asset_ver_json,
        headers=new_headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o.author_id == new_profile_id

    # Test: Ensure author_id remains unchanged when not provided
    # test as asset-owner
    new_profile_asset_ver_json.pop("author_id", None)
    r = client.post(
        f"{api_base}/assets/{new_profile_asset_id}/versions/0.2.0",
        json=new_profile_asset_ver_json,
        headers=new_headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o.author_id == new_profile_id

    # Test: Ensure author_id remains unchanged when not provided
    # test as super-admin
    new_profile_asset_ver_json.pop("author_id", None)
    r = client.post(
        f"{api_base}/assets/{new_profile_asset_id}/versions/0.2.0",
        json=new_profile_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o.author_id == new_profile_id

    # Test: Ensure author_id remains unchanged when super-admin updates author_id
    new_profile_asset_ver_json["author_id"] = profile_id
    r = client.post(
        f"{api_base}/assets/{new_profile_asset_id}/versions/0.2.0",
        json=new_profile_asset_ver_json,
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o.author_id == new_profile_id

    r = client.get(
        f"{api_base}/assets/{asset_id}/versions/0.2.0")
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert 'links' in o.contents
    assert len(o.contents['links']) == 2
    assert o.contents['links'][0] == test_link_update1
    assert o.contents['links'][1] == test_link_update2

    other_profile = create_profile()
    other_headers = other_profile.authorization_header()

    r = client.delete(
        f"{api_base}/assets/{asset_id}", headers=other_headers)
    assert_status_code(r, HTTPStatus.UNAUTHORIZED)
    o = munchify(r.json())
    assert f"not satisfied" in o.detail

    r = client.delete(
        f"{api_base}/assets/{asset_id}", headers=headers)
    assert_status_code(r, HTTPStatus.OK)

    r = client.delete(
        f"{api_base}/assets/{asset_id}", headers=headers)
    assert_status_code(r, HTTPStatus.NOT_FOUND)
    o = munchify(r.json())
    assert f"asset {asset_id} not found" in o.detail

    r = client.delete(
        f"{api_base}/assets/{asset_id}/versions/0.2.0", headers=headers)
    assert_status_code(r, HTTPStatus.FORBIDDEN)
    o = munchify(r.json())
    assert o.detail == "asset version be deleted by the asset owner"

    # Ensure asset was deleted
    r = client.get(
        f"{api_base}/assets/{asset_id}")
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert len(o) == 0

    # Ensure asset-versions were deleted
    r = client.get(
        f"{api_base}/assets/{asset_id}/versions/0.2.0")
    assert_status_code(r, HTTPStatus.NOT_FOUND)


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


def test_invalid_profile_id(client, api_base):
    r = client.delete(
        f"{api_base}/files",
        headers={"Authorization": "Bearer token"})
    assert_status_code(r, HTTPStatus.NOT_FOUND)
