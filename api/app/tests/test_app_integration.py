import hashlib
from uuid import UUID

from fastapi.testclient import TestClient
from munch import munchify

from main import app

from config import app_config

client = TestClient(app)

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
    response = client.post("/api/v1/profiles/create",
                           json={
                               "name": test_profile_name,
                               "description": test_profile_description,
                               "signature": test_profile_signature,
                               "tags": test_profile_tags,
                               "profile_base_href": test_profile_href,})
    o = munchify(response.json())
    assert o.name == test_profile_name
    assert o.description == test_profile_description
    assert o.signature == test_profile_signature
    assert o.tags == test_profile_tags
    assert o.profile_base_href == test_profile_href
    profile_id = o.id

    # validate existence
    response = client.get(f"/api/v1/profiles/{profile_id}")
    o = munchify(response.json())
    assert o.name == test_profile_name
    assert o.id == profile_id

    # update the profile data
    o = munchify(client.post(f"/api/v1/profiles/update/{profile_id}",
                           json={"name": test_profile_name + "-updated"}).json())
    assert o.id == profile_id
    assert o.name == test_profile_name + "-updated"

    # validate existence again
    o = munchify(client.get(f"/api/v1/profiles/{profile_id}").json())
    assert o.id == profile_id
    assert o.name == test_profile_name + "-updated"

    # validate email
    o = munchify(client.get(f"/api/v1/profiles/validate_email/{profile_id}").json())
    assert o.profile_id == profile_id

    # Start session
    o = munchify(client.get(f"/api/v1/profiles/start_session/{profile_id}").json())
    assert o.profile.id == profile_id
    assert len(o.sessions) > 0
    assert len(o.token) > 0
    profile_token = o.token

    # upload content
    files = [
        ('files', (test_file_name, test_file_contents, test_file_content_type)),
        ('files', (test_file_name, test_file_contents, test_file_content_type)),
    ]
    headers = {
        'Authorization': f'Bearer {profile_token}',
    }
    o = munchify(client.post(f"/api/v1/upload/store", files=files, headers=headers).json())
    assert len(o.events) == 2
    assert len(o.files) == 2
    file_ids = list(o.files)
    event_ids = list(o.events)

    # validate file
    for f in file_ids:
        o = munchify(client.get(f"/api/v1/files/{f}").json())
        assert o.id == f
        assert o.content_hash == test_file_content_hash
        assert o.lifetime == 0
        assert o.name == test_file_name
        assert o.owner == profile_id
        assert o.size == len(test_file_contents)

    # validate pending uploads
    o = munchify(client.get(f"/api/v1/files/by_content/{test_file_content_hash}").json())
    assert o.content_hash == test_file_content_hash

    results = client.get(f"/api/v1/files/by_owner/{profile_id}").json()
    assert(len(results) > 0)
    for r in results:
        o = munchify(r)
        assert o.content_hash == test_file_content_hash

    results = client.get(f"/api/v1/upload/pending", headers=headers).json()
    assert len(results) > 0
    for r in results:
        o = munchify(r)
        assert o.content_hash == test_file_content_hash
        assert o.id in file_ids

    # create asset collection
    r = client.post(f"/api/v1/assets/create", json={'name':test_asset_collection_name})
    assert r.status_code == 200
    o = munchify(r.json())
    assert o.name == test_asset_collection_name
    collection_id = UUID(o.id)

    # create asset
    test_asset_json = {
        'collection_id': collection_id,
        'name': test_asset_name,
    }
    o = munchify(client.post(f"/api/v1/assets/create", json=test_asset_json).json())
    asset_id = o.id

    # add content to asset
    test_asset_ver_json = {
        'asset_id': asset_id,
        'commit_ref': test_commit_ref,
        'contents': file_ids,
        'name': test_asset_name,
    }
    o = munchify(client.post(f"/api/v1/assets/{asset_id}/versions/0.1.0/create",
                             json=test_asset_ver_json,
                             headers=headers).json())
    assert o.asset_id == asset_id
    assert o.collection_id == collection_id
    assert len(o.versions) == 1
    assert o.versions[0].name == test_asset_name
    assert o.versions[0].version == [0,1,0]
    for f in o.contents:
        assert f in file_ids

    # query asset
    o = munchify(client.get(f"/api/v1/assets/{asset_id}").json())
    assert o.asset_id == asset_id
    assert o.collection_id == collection_id
    assert len(o.versions) == 1

    # create new asset version
    test_asset_ver_json = {
        asset_id: asset_id,
        'commit_ref': test_commit_ref + '-updated',
        'contents': file_ids[1:],
        'name': test_asset_name + '-updated',
    }
    o = munchify(client.post(f"/api/v1/assets/{asset_id}/versions/0.2.0",
                             json=test_asset_ver_json,
                             headers=headers).json())
    assert o.asset_id == asset_id
    assert o.collection_id == collection_id
    assert len(o.versions) == 2
    assert o.versions[0].commit_ref == test_commit_ref + '-updated'
    assert o.versions[0].name == test_asset_name + '-updated'
    assert len(o.versions[0].contents) == 1
    assert o.versions[0].contents[0] == file_ids[1]

    assert o.versions[1].commit_ref == test_commit_ref
    assert o.versions[1].name == test_asset_name
    assert len(o.versions[1].contents) == 2

    # query asset version
    o = munchify(client.get("/api/v1/assets/{asset_id}/versions/0.1.0").json())
    o = munchify(client.get("/api/v1/assets/{asset_id}/versions/0.2.0").json())
    assert o.asset_id == asset_id
    assert o.asset_id == asset_id
    assert o.version == [0, 1, 0]
    assert o.version == [0, 2, 0]

    o = munchify(client.get("/api/v1/assets/{asset_id}/versions/0.2.0").json())
    assert o.asset_id == asset_id
    assert o.collection_id == collection_id
    assert len(o.files) == 1
    assert o.files[0].name == test_file_name
    assert o.files[0].content_hash == test_file_content_hash

    # update existing asset version
    test_asset_ver_json = {
        asset_id: asset_id,
        'commit_ref': test_commit_ref + '-updated-2',
        'name': test_asset_name + '-updated-2',
        'contents': [],
    }
    o = munchify(client.post(f"/api/v1/assets/{asset_id}/versions/0.2.0/create",
                             json=test_asset_ver_json,
                             headers=headers).json())
    assert o.commit_ref == test_commit_ref + '-updated-2'
    assert o.name == test_asset_name + '-updated-2'
    assert len(o.contents) == 0



def test_create_asset():
    """Test a full asset creation run through the API"""

    assets = client.get("/api/v1/assets")
    assert len(assets) > 0
