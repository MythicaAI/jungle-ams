import hashlib
from http import HTTPStatus
from pathlib import Path

from fastapi.testclient import TestClient

from config import app_config
from main import app
from tests.shared_test import FileContentTestObj, assert_status_code
from tests.fixtures.create_profile import create_profile # pylint: disable=unused-import
from tests.fixtures.app import use_local_storage_fixture # pylint: disable=unused-import
from tests.fixtures.uploader import request_to_upload_files # pylint: disable=unused-import


client = TestClient(app)
test_profile_name = "test-profile"
test_profile_description = "test-description"
test_profile_signature = 32 * 'X'
test_profile_tags = {"tag-a": "a", "tag-b": "b", "tag-c": "c"}
test_profile_href = "https://test.com/"
test_profile_full_name = "test-profile-full-name"
test_profile_email = "test@test.com"
test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_hash = hashlib.sha1(test_file_contents).hexdigest()
test_file_content_type = "application/octet-stream"
test_asset_name = 'test-asset'
test_asset_collection_name = 'test-collection'
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"


def test_download(
    use_local_storage_fixture, # pylint: disable=redefined-outer-name
    create_profile, # pylint: disable=redefined-outer-name
    api_base,
    request_to_upload_files, # pylint: disable=redefined-outer-name
):
    assert use_local_storage_fixture.use_local_storage is True
    test_profile = create_profile(
        name=test_profile_name,
        email=test_profile_email,
        full_name=test_profile_full_name,
        signature=test_profile_signature,
        description=test_profile_description,
        profile_href=test_profile_href,
    )
    profile_id = test_profile.profile.profile_id
    assert profile_id is not None
    headers: dict = test_profile.authorization_header()
    files = [
        FileContentTestObj(
            file_name=test_file_name,
            file_id=str(file_id),
            contents=test_file_contents,
            content_hash=hashlib.sha1(test_file_contents).hexdigest(),
            content_type=test_file_content_type,
            size=len(test_file_contents),
        )
        for file_id in range(2)
    ]
    files = request_to_upload_files(headers, files)

    for file_id in files:
        # Get download info
        info_response = client.get(
            f"{api_base}/download/info/{file_id}", headers=headers
        )
        assert_status_code(info_response, HTTPStatus.OK)
        download_info = info_response.json()
        print(f"{file_id=}")
        print(f"Download info: {download_info}")

        # Check the download URL
        assert "content_hash" in download_info
        assert "url" in download_info
        assert download_info["content_hash"] in download_info["url"]

        # Try to download the file (this should return a redirect)
        download_response = client.get(
            f"{api_base}/download/{file_id}",
            headers=headers,
            follow_redirects=False,
        )
        assert_status_code(download_response, HTTPStatus.TEMPORARY_REDIRECT)

        assert "Location" in download_response.headers
        parsed_location = download_response.headers["Location"]
        print(f"Download parsed_location: {parsed_location}")
        local_storage_path = app_config().local_storage_path
        assert parsed_location.startswith(local_storage_path)

        file_path = parsed_location
        full_file_path = Path(local_storage_path) / file_path

        assert full_file_path.exists(), f"File does not exist at {full_file_path}"

        with open(full_file_path, "rb") as f:
            file_contents = f.read()
        assert file_contents == test_file_contents

        assert hashlib.sha1(file_contents).hexdigest() == test_file_content_hash
