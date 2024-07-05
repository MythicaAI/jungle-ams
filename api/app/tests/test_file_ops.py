from tests.shared_test import upload_files, make_random_content


def test_file_create_delete(client, api_base, create_profile):
    test_profile = create_profile()
    profile_id, auth_token = test_profile.profile, test_profile.auth_token
    auth_headers = {"Authorization": f"Bearer {auth_token}"}
    files = [make_random_content("zip") for _ in range(100)]
    upload_files(client, api_base, profile_id, auth_headers, files)
