import hashlib

from fastapi.testclient import TestClient

from routes.responses import (
    ValidateEmailResponse,
    ValidateEmailState,
)

from main import app
from tests.fixtures.create_profile import create_profile # pylint: disable=unused-import


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


def test_email_validation(api_base, client, create_profile): # pylint: disable=redefined-outer-name

    test_profile = create_profile(name=test_profile_name,
                                email=test_profile_email,
                                full_name=test_profile_full_name,
                                signature=test_profile_signature,
                                description=test_profile_description,
                                profile_href=test_profile_href)
    profile_id = test_profile.profile.profile_id
    assert profile_id is not None
    headers = test_profile.authorization_header()
    headers = test_profile.authorization_header()
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
    assert validate_res.state == ValidateEmailState.validated
