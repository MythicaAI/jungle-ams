import hashlib
from http import HTTPStatus
from uuid import UUID

from fastapi.testclient import TestClient

from main import app
from munch import munchify

from tests.shared_test import assert_status_code

client = TestClient(app)
api_base = "/api/v1"
test_profile_name = "test-profile"
test_profile_description = "test-description"
test_profile_signature = 32*'X'
test_profile_tags = {"tag-a": "a", "tag-b": "b", "tag-c": "c"}
test_profile_href = "https://test.com/"
test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_hash = hashlib.sha1(test_file_contents).hexdigest()
test_file_content_type = "application/octet-stream"
test_asset_name = 'test-asset'
test_asset_collection_name = 'test-collection'
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"


def create_files() -> list[UUID]:
    response = client.post(f"{api_base}/profiles",
                           json={
                               "name": test_profile_name,
                               "description": test_profile_description,
                               "signature": test_profile_signature,
                               "profile_base_href": test_profile_href, })
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
    o = munchify(client.get(f"{api_base}/validate-email", headers=headers).json())
    assert o.owner == profile_id
    assert o.code is not None
    o = munchify(client.get(f"{api_base}/validate-email/{o.code}", headers=headers).json())
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
    o = munchify(client.post(
        f"{api_base}/upload/store",
        files=files,
        headers=headers).json())
    assert len(o.files) == 2
    file_ids = list(map(lambda f: UUID(f.file_id), o.files))
    return file_ids

# TODO: fix download
# def test_download():
#     api = API(client)
#     with tempfile.TemporaryDirectory() as tmp_dir:
#         for f in create_files():
#             with pytest.raises(FileNotFoundError, match="TODO: add local file testing"):
#                 api.download_file(f, Path(tmp_dir))
