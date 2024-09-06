import hashlib
from http import HTTPStatus
from pathlib import Path
from uuid import UUID

from fastapi.testclient import TestClient
import pytest

from config import AppConfig, app_config
from routes.responses import (
    ProfileResponse,
    SessionStartResponse,
    ValidateEmailResponse,
)
from routes.upload.upload import UploadResponse
from main import app
from tests.shared_test import assert_status_code


client = TestClient(app)
api_base = "/v1"
test_profile_name = "test-profile"
test_profile_description = "test-description"
test_profile_signature = 32 * "X"
test_profile_tags = {"tag-a": "a", "tag-b": "b", "tag-c": "c"}
test_profile_href = "https://test.com/"
test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_hash = hashlib.sha1(test_file_contents).hexdigest()
test_file_content_type = "application/octet-stream"
test_asset_name = "test-asset"
test_asset_collection_name = "test-collection"
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"



def create_profile() -> dict:
    response = client.post(
        f"{api_base}/profiles",
        json={
            "name": test_profile_name,
            "description": test_profile_description,
            "signature": test_profile_signature,
            "profile_base_href": test_profile_href,
        },
    )
    assert_status_code(response, HTTPStatus.CREATED)

    profile = ProfileResponse(**response.json())
    assert profile.name == test_profile_name
    assert profile.description == test_profile_description
    assert profile.signature == test_profile_signature
    assert profile.profile_base_href == test_profile_href
    profile_id = profile.profile_id

    # validate existence
    r = client.get(f"{api_base}/profiles/{profile_id}")
    assert_status_code(r, HTTPStatus.OK)
    profile = ProfileResponse(**r.json())
    assert profile.name == test_profile_name
    assert profile.profile_id == profile_id

    # Start session
    r = client.get(f"{api_base}/profiles/start_session/{profile_id}")
    assert_status_code(r, HTTPStatus.OK)
    session_response = SessionStartResponse(**r.json())
    assert session_response.profile.profile_id == profile_id
    assert len(session_response.token) > 0
    profile_token = session_response.token
    headers = {
        "Authorization": f"Bearer {profile_token}",
    }

    # validate email
    validate_res = ValidateEmailResponse(
        **client.get(f"{api_base}/validate-email", headers=headers).json()
    )
    assert validate_res.owner_id == profile_id
    assert validate_res.code is not None
    validate_res = ValidateEmailResponse(
        **client.get(
            f"{api_base}/validate-email/{validate_res.code}", headers=headers
        ).json()
    )
    assert validate_res.owner_id == profile_id
    assert validate_res.state == "validated"

    return headers


def create_files(headers: dict) -> tuple[UUID]:
    # upload content
    files = [
        ("files", (test_file_name, test_file_contents, test_file_content_type)),
        ("files", (test_file_name, test_file_contents, test_file_content_type)),
    ]
    upload_res = UploadResponse(
        **client.post(f"{api_base}/upload/store", files=files, headers=headers).json()
    )
    assert len(upload_res.files) == 2
    return (i.file_id for i in upload_res.files)


def test_download(patch_settings_local_storage):
    assert patch_settings_local_storage.use_local_storage is True
    headers = create_profile()
    file_ids = create_files(headers)

    for file_id in file_ids:
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
