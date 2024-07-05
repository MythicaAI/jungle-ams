"""Test of file operations"""

# pylint: disable=redefined-outer-name, unused-import

from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import uploader
from tests.shared_test import make_random_content


def test_file_create_delete(create_profile, uploader):
    test_profile = create_profile()
    auth_headers = test_profile.authorization_header()
    files = [make_random_content("zip") for _ in range(10)]
    uploader(test_profile.profile.id, auth_headers, files)
