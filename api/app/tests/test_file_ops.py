from tests.shared_test import make_random_content


def test_file_create_delete(client, api_base, create_profile, uploader):
    test_profile = create_profile()
    profile_id, auth_token = test_profile.profile, test_profile.auth_token
    auth_headers = {"Authorization": f"Bearer {auth_token}"}
    files = [make_random_content("zip") for _ in range(10)]
    uploader(test_profile.profile.id, auth_headers, files)
