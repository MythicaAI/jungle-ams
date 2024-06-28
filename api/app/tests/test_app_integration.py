import hashlib
from http import HTTPStatus

from fastapi.testclient import TestClient
from munch import munchify

from main import app
from routes.type_adapters import register_adapters
from tests.shared_test import get_random_string, assert_status_code

client = TestClient(app)

api_base = "/api/v1"
test_profile_name = "test-profile"
test_profile_full_name = "test-profile-full-name"
test_profile_description = "test-description"
test_profile_signature = 'X' * 32
test_profile_email = "test@test.com"
test_profile_tags = {"tag-a": "a", "tag-b": "b", "tag-c": "c"}
test_profile_href = "https://test.com/"
test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_hash = hashlib.sha1(test_file_contents).hexdigest()
test_file_content_type = "application/octet-stream"
test_asset_name = 'test-asset'
test_asset_description = 'test-asset-description'
test_asset_collection_name = 'test-collection'
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"


# see localhost/docs for examples

def test_create_profile_and_assets():
    register_adapters()

    response = client.post(f"{api_base}/profiles",
                           json={
                               'name': test_profile_name,
                               'email': test_profile_email,
                               'full_name': test_profile_full_name,
                               'signature': test_profile_signature,
                               'description': test_profile_description,
                               'profile_base_href': test_profile_href, })
    assert_status_code(response, HTTPStatus.CREATED)
    o = munchify(response.json())
    assert o.name == test_profile_name
    assert o.description == test_profile_description
    assert o.signature == test_profile_signature
    assert o.profile_base_href == test_profile_href
    profile_id = o.id

    # validate existence
    response = client.get(f"{api_base}/profiles/{profile_id}")
    o = munchify(response.json())
    assert o.name == test_profile_name
    assert o.id == profile_id

    # Start session
    o = munchify(client.get(f"{api_base}/profiles/start_session/{profile_id}").json())
    assert o.profile.id == profile_id
    assert len(o.sessions) > 0
    assert len(o.token) > 0
    profile_token = o.token
    headers = {
        'Authorization': f'Bearer {profile_token}',
    }

    # validate email
    o = munchify(client.get(
        f"{api_base}/validate-email",
        headers=headers).json())
    assert o.owner == profile_id
    assert len(o.link) > 0
    assert len(o.code) > 0
    assert o.state == 'link_sent'
    validate_code = o.code

    o = munchify(client.get(
        f"{api_base}/validate-email/{validate_code}",
        headers=headers).json())
    assert o.owner == profile_id
    assert o.state == 'validated'

    # update the profile data
    o = munchify(client.post(
        f"{api_base}/profiles/{profile_id}",
        json={"name": test_profile_name + "-updated"},
        headers=headers).json())
    assert o.id == profile_id
    assert o.name == test_profile_name + "-updated"

    # validate updated profile existence again
    o = munchify(client.get(f"{api_base}/profiles/{profile_id}").json())
    assert o.id == profile_id
    assert o.name == test_profile_name + "-updated"

    # upload content
    files = [
        ('files', (test_file_name, test_file_contents, test_file_content_type)),
        ('files', (test_file_name, test_file_contents, test_file_content_type)),
    ]
    r = client.post(
        f"{api_base}/upload/store",
        files=files,
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert len(o.files) == 2
    asset_contents = list(map(lambda x: {
        'file_id': str(x.file_id),
        'file_name': x.file_name}, o.files))
    file_ids = list(map(lambda x: x.file_id, o.files))

    # validate file content
    for f in o.files:
        assert f.event_ids is not None
        assert len(f.event_ids) > 0
        assert f.file_name == test_file_name
        assert f.content_type is not None
        assert f.content_hash == test_file_content_hash

        o = munchify(client.get(
            f"{api_base}/files/{f.file_id}",
            headers=headers).json())
        assert o.file_id == f.file_id
        assert o.content_hash == test_file_content_hash
        assert o.file_name == test_file_name
        assert o.owner == profile_id
        assert o.size == len(test_file_contents)

    # validate pending uploads
    o = munchify(client.get(
        f"{api_base}/files/by_content/{test_file_content_hash}",
        headers=headers).json())
    assert o.content_hash == test_file_content_hash

    # check the profiles pending uploads
    results = client.get(
        f"{api_base}/upload/pending",
        headers=headers).json()
    assert len(results) > 0
    for r in results:
        o = munchify(r)
        assert o.content_hash == test_file_content_hash
        assert o.file_id in file_ids
        # check the download
        download_info = client.get(
            f"{api_base}/download/info/{o.file_id}")
        assert_status_code(download_info, HTTPStatus.OK)
        o = munchify(download_info.json())
        assert o.content_hash == test_file_content_hash
        assert o.file_id in file_ids
        assert o.url is not None

    # create org to contain assets
    org_name = 'org-' + get_random_string(10, digits=False)
    r = client.post(
        f"{api_base}/orgs/",
        json={'name': org_name},
        headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert profile_id == o.admin.profile_id
    org_id = o.org.id

    # create asset in org
    o = munchify(client.post(
        f"{api_base}/assets",
        json={'org_id': str(org_id)},
        headers=headers).json())
    asset_id = o.id

    # asset object returned, without version information
    r = client.get(
        f"{api_base}/assets/owned",
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 1
    o = munchify(r.json()[0])
    assert o.asset_id == asset_id
    assert o.owner == profile_id
    assert o.org_id == org_id
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
    assert o.asset_id == asset_id
    assert o.owner == profile_id
    assert o.org_id == org_id
    assert o.version == [0, 0, 0]
    assert o.author is None
    assert o.name is None

    # add content to asset
    test_asset_ver_json = {
        'asset_id': asset_id,
        'commit_ref': test_commit_ref,
        'contents': {"files": asset_contents},
        'name': test_asset_name,
        'description': test_asset_description,
        'author': profile_id,
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
        assert f.file_id in file_ids
        assert f.size == len(test_file_contents)
        assert len(f.content_hash) > 0

    # query asset versions
    r = client.get(f"{api_base}/assets/{asset_id}").json()
    assert len(r) == 1
    o = munchify(r[0])
    assert o.asset_id == asset_id
    assert o.org_id == org_id

    # create new asset version
    test_asset_ver_json = {
        asset_id: asset_id,
        'commit_ref': test_commit_ref + '-updated',
        'contents': {'files': asset_contents[1:]},
        'name': test_asset_name + '-updated',
        'author': profile_id,
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
    assert o.contents['files'][0].file_id == file_ids[1]

    # validate asset query at version 0.0.0, still returns empty version info
    r = client.get(
        f"{api_base}/assets/{asset_id}/versions/0.0.0",
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o.asset_id == asset_id
    assert o.owner == profile_id
    assert o.org_id == org_id
    assert o.version == [0, 0, 0]
    assert o.author is None
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
    assert o.contents['files'][0].file_id == file_ids[1]
    assert o.contents['files'][0].content_hash == test_file_content_hash

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
        assert o.asset_id == asset_id
        assert o.owner == profile_id
        assert o.author == profile_id
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

    # update existing asset version
    test_asset_ver_json = {
        asset_id: asset_id,
        'commit_ref': test_commit_ref + '-updated-2',
        'name': test_asset_name + '-updated-2',
        'contents': {'files': []},
        'author': profile_id,
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


def test_invalid_profile_url():
    response = client.post(f"{api_base}/profiles",
                           json={
                               'name': test_profile_name,
                               'email': test_profile_email,
                               'full_name': test_profile_full_name,
                               'signature': test_profile_signature,
                               'description': test_profile_description,
                               'profile_base_href': "ht://whatever.com", })
    assert_status_code(response, HTTPStatus.UNPROCESSABLE_ENTITY)


def test_blank_profile_url():
    response = client.post(f"{api_base}/profiles",
                           json={
                               'name': test_profile_name,
                               'email': test_profile_email,
                               'full_name': test_profile_full_name,
                               'signature': test_profile_signature,
                               'description': test_profile_description})
    assert_status_code(response, HTTPStatus.CREATED)
