import hashlib
from http import HTTPStatus
# import os
# from pathlib import Path
import tempfile
# from unittest.mock import patch
# from urllib.parse import urlparse
from uuid import UUID

from fastapi.testclient import TestClient
import pytest

from config import app_config
from routes.responses import ProfileResponse, SessionStartResponse, ValidateEmailResponse
from routes.upload.upload import UploadResponse
from main import app
from tests.shared_test import assert_status_code

# os.environ['USE_LOCAL_STORAGE'] = "True"

client = TestClient(app)
api_base = "/v1"
test_profile_name = "test-profile"
test_profile_description = "test-description"
test_profile_signature = 32 * 'X'
test_profile_tags = {"tag-a": "a", "tag-b": "b", "tag-c": "c"}
test_profile_href = "https://test.com/"
test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_hash = hashlib.sha1(test_file_contents).hexdigest()
test_file_content_type = "application/octet-stream"
test_asset_name = 'test-asset'
test_asset_collection_name = 'test-collection'
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"


@pytest.fixture
def patch_settings(request: pytest.FixtureRequest):
    # Make a copy of the original settings
    settings = app_config()
    original_settings = settings.model_copy()

    # Collect the env vars to patch
    env_vars_to_patch = getattr(request, "param", {})

    # Patch the settings to use the default values
    for k, v in settings.model_fields.items():
        setattr(settings, k, v.default)

    # Patch the settings with the parametrized env vars
    for key, val in env_vars_to_patch.items():
        # Raise an error if the env var is not defined in the settings
        if not hasattr(settings, key):
            raise ValueError(f"Unknown setting: {key}")

        # Raise an error if the env var has an invalid type
        expected_type = getattr(settings, key).__class__
        if not isinstance(val, expected_type):
            raise ValueError(
                f"Invalid type for {key}: {val.__class__} instead "
                "of {expected_type}"
            )
        setattr(settings, key, val)

    yield settings

    # Restore the original settings
    settings.__dict__.update(original_settings.__dict__)

def create_profile() -> dict:
    response = client.post(f"{api_base}/profiles",
                           json={
                               "name": test_profile_name,
                               "description": test_profile_description,
                               "signature": test_profile_signature,
                               "profile_base_href": test_profile_href, })
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
        'Authorization': f'Bearer {profile_token}',
    }

    # validate email
    validate_res = ValidateEmailResponse(**client.get(f"{api_base}/validate-email", headers=headers).json())
    assert validate_res.owner_id == profile_id
    assert validate_res.code is not None
    validate_res = ValidateEmailResponse(**client.get(f"{api_base}/validate-email/{validate_res.code}", headers=headers).json())
    assert validate_res.owner_id == profile_id
    assert validate_res.state == 'validated'

    return headers

def create_files(headers: dict) -> tuple[UUID]:
    # upload content
    files = [
        ('files', (test_file_name, test_file_contents, test_file_content_type)),
        ('files', (test_file_name, test_file_contents, test_file_content_type)),
    ]
    upload_res = UploadResponse(**client.post(
        f"{api_base}/upload/store",
        files=files,
        headers=headers).json())
    assert len(upload_res.files) == 2
    return (i.file_id for i in upload_res.files)

# @pytest.mark.parametrize(
#     "patch_settings",
#     [
#         {"use_local_storage": True,},
#     ],
#     indirect=True,
# )
# def test_download(patch_settings: AppConfig):
def test_download():
    headers = create_profile()

    with tempfile.TemporaryDirectory() as tmp_dir:
        file_ids = create_files(headers)
        for file_id in file_ids:
            # Get download info
            info_response = client.get(f"{api_base}/download/info/{file_id}", headers=headers)
            assert_status_code(info_response, HTTPStatus.OK)
            # download_info = info_response.json()
            
            # # Download the file
            # download_response = client.get(f"{api_base}/download/{file_id}", headers=headers)
            # assert_status_code(download_response, HTTPStatus.OK)
            
            # # Check content type
            # # TODO: the content_type changes in upload_internal() :: ctx.extension = filename.rpartition(".")[-1].lower()
            # # assert download_response.headers['Content-Type'] == test_file_content_type
            
            # # Check content
            # downloaded_content = download_response.content
            # assert downloaded_content == test_file_contents

