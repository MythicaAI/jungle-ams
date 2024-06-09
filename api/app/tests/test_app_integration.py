import hashlib
from http import HTTPStatus
from uuid import UUID

from fastapi.testclient import TestClient
from munch import munchify

from main import app

from config import app_config

client = TestClient(app)

api_base = "/api/v1"
test_profile_name = "test-profile"
test_profile_description = "test-description"
test_profile_signature = "test-signature"
test_profile_tags = {"tag-a": "a", "tag-b": "b", "tag-c": "c"}
test_profile_href = "https://test.com"
test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_hash = hashlib.sha1(test_file_contents).hexdigest()
test_file_content_type = "application/octet-stream"
test_asset_name = 'test-asset'
test_asset_collection_name = 'test-collection'
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"


# see localhost/docs for examples

def test_create_profile_and_assets():
    response = client.post(f"{api_base}/profiles",
                           json={
                               "name": test_profile_name,
                               "description": test_profile_description,
                               "signature": test_profile_signature,
                               "profile_base_href": test_profile_href, })
    assert response.status_code == HTTPStatus.CREATED
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

    # validate email
    o = munchify(client.get(f"{api_base}/profiles/validate_email/{profile_id}").json())
    assert o.profile_id == profile_id

    # Start session
    o = munchify(client.get(f"{api_base}/profiles/start_session/{profile_id}").json())
    assert o.profile.id == profile_id
    assert len(o.sessions) > 0
    assert len(o.token) > 0
    profile_token = o.token
    headers = {
        'Authorization': f'Bearer {profile_token}',
    }

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
    o = munchify(client.post(
        f"{api_base}/upload/store",
        files=files,
        headers=headers).json())
    assert len(o.events) == 2
    assert len(o.files) == 2
    file_ids = list(o.files)
    event_ids = list(o.events)

    # validate file content
    for f in file_ids:
        o = munchify(client.get(f"{api_base}/files/{f}").json())
        assert o.id == f
        assert o.content_hash == test_file_content_hash
        assert o.lifetime == 0
        assert o.name == test_file_name
        assert o.owner == profile_id
        assert o.size == len(test_file_contents)

    # validate pending uploads
    o = munchify(client.get(f"{api_base}/files/by_content/{test_file_content_hash}").json())
    assert o.content_hash == test_file_content_hash

    results = client.get(f"{api_base}/files/by_owner/{profile_id}").json()
    assert (len(results) > 0)
    for r in results:
        o = munchify(r)
        assert o.content_hash == test_file_content_hash

    # check the profiles pending uploads
    results = client.get(
        f"{api_base}/upload/pending",
        headers=headers).json()
    assert len(results) > 0
    for r in results:
        o = munchify(r)
        assert o.content_hash == test_file_content_hash
        assert o.id in file_ids

    # create asset collection
    r = client.post(
        f"{api_base}/assets/",
        json={},
        headers=headers)
    assert r.status_code == 201
    o = munchify(r.json())
    collection_id = o.id
    r = client.post(
        f"{api_base}/assets/{collection_id}/versions/1.0.0",
        json={'name': test_asset_collection_name, 'author': profile_id},
        headers=headers)
    o = munchify(r.json())
    assert r.status_code == 201
    assert o.name == test_asset_collection_name
    assert o.version == [1,0,0]

    # create asset in collection
    o = munchify(client.post(
        f"{api_base}/assets",
        json={'collection_id': str(collection_id)},
        headers=headers).json())
    asset_id = o.id

    # add content to asset
    test_asset_ver_json = {
        'asset_id': asset_id,
        'commit_ref': test_commit_ref,
        'contents': file_ids,
        'name': test_asset_name,
        'author': profile_id,
    }
    o = munchify(client.post(
        f"{api_base}/assets/{asset_id}/versions/0.1.0",
        json=test_asset_ver_json,
        headers=headers).json())
    assert o.asset_id == asset_id
    assert o.collection_id == collection_id
    assert o.name == test_asset_name
    assert o.version == [0, 1, 0]
    for f in o.contents:
        assert f.file_id in file_ids
        assert f.size == len(test_file_contents)
        assert len(f.content_hash) > 0

    # query asset versions
    r = client.get(f"{api_base}/assets/{asset_id}").json()
    assert len(r) == 1
    o = munchify(r[0])
    assert o.asset_id == asset_id
    assert o.collection_id == collection_id

    # create new asset version
    test_asset_ver_json = {
        asset_id: asset_id,
        'commit_ref': test_commit_ref + '-updated',
        'contents': file_ids[1:],
        'name': test_asset_name + '-updated',
        'author': profile_id,
    }
    o = munchify(client.post(
        f"{api_base}/assets/{asset_id}/versions/0.2.0",
        json=test_asset_ver_json,
        headers=headers).json())
    assert o.asset_id == asset_id
    assert o.collection_id == collection_id
    assert o.commit_ref == test_commit_ref + '-updated'
    assert o.name == test_asset_name + '-updated'
    assert o.version == [0, 2, 0]
    assert len(o.contents) == 1
    assert o.contents[0].file_id == file_ids[1]

    # query specific asset version
    o = munchify(client.get(f"{api_base}/assets/{asset_id}/versions/0.1.0").json())
    assert o.asset_id == asset_id
    assert o.collection_id == collection_id
    assert o.version == [0, 1, 0]

    o = munchify(client.get(f"{api_base}/assets/{asset_id}/versions/0.2.0").json())
    assert o.asset_id == asset_id
    assert o.collection_id == collection_id
    assert o.version == [0, 2, 0]
    assert o.name == test_asset_name + '-updated'
    assert len(o.contents) == 1
    assert o.contents[0].file_id == file_ids[1]
    assert o.contents[0].content_hash == test_file_content_hash

    # query versions for asset, assert sort order of versions returned
    r = client.get(f"{api_base}/assets/{asset_id}").json()
    assert len(r) == 2
    r[0] = munchify(r[0])
    r[1] = munchify(r[1])
    assert r[0].asset_id == asset_id
    assert r[1].asset_id == asset_id
    assert r[0].collection_id == collection_id
    assert r[1].collection_id == collection_id
    assert r[0].version == [0, 1, 0]
    assert r[1].version == [0, 2, 0]

    # update existing asset version
    test_asset_ver_json = {
        asset_id: asset_id,
        'commit_ref': test_commit_ref + '-updated-2',
        'name': test_asset_name + '-updated-2',
        'contents': [],
        'author': profile_id,
    }
    o = munchify(client.post(
        f"{api_base}/assets/{asset_id}/versions/0.2.0",
        json=test_asset_ver_json,
        headers=headers).json())
    assert o.commit_ref == test_commit_ref + '-updated-2'
    assert o.name == test_asset_name + '-updated-2'
    assert len(o.contents) == 0

