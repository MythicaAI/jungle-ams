"""Test of file operations"""
# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

import pytest
from munch import munchify

from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import uploader
from tests.shared_test import assert_status_code, make_random_content


@pytest.mark.asyncio
async def test_file_create_delete(create_profile, uploader):
    test_profile = await create_profile()
    auth_headers = test_profile.authorization_header()
    files = [make_random_content("png") for _ in range(10)]
    uploader(test_profile.profile.profile_id, auth_headers, files)


@pytest.mark.asyncio
async def test_file_ops(client, api_base, create_profile):
    test_profile = await create_profile()
    auth_headers = test_profile.authorization_header()
    files = [make_random_content("png")]

    storage_uri = '/upload/store'
    file_data = list(map(
        lambda x: ('files', (x.file_name, x.contents, x.content_type)),
        files))

    r = client.post(
        f"{api_base}{storage_uri}",
        files=file_data,
        headers=auth_headers)

    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert len(files) == len(o.files)

    # purpose = FilePurpose.API_UPLOAD
    r2 = client.get(
        f"{api_base}/files/by_purpose/api_upload",
        headers=auth_headers)

    assert_status_code(r2, HTTPStatus.OK)
    o2 = munchify(r2.json())
    assert len(o2) == len(o.files)

    r3 = client.get(
        f"{api_base}/files/by_content/xxxxxxxx",
        headers=auth_headers)

    assert_status_code(r3, HTTPStatus.NOT_FOUND)

    r4 = client.get(
        f"{api_base}/files/by_content/{o.files[0].content_hash}",
        headers=auth_headers)

    assert_status_code(r4, HTTPStatus.OK)

    r5 = client.delete(
        f"{api_base}/files/{o.files[0].file_id}",
        headers=auth_headers)

    assert_status_code(r5, HTTPStatus.OK)
