from http import HTTPStatus
from uuid import UUID

import pytest
from munch import munchify

from routes.responses import FileUploadResponse
from tests.shared_test import FileContentTestObj, assert_status_code


@pytest.fixture(scope='module')
def uploader(client, api_base):
    """Uploader factory fixture test content to API"""

    def _uploader(
            profile_id: UUID,
            auth_headers,
            files: list[FileContentTestObj]) -> dict[UUID, FileUploadResponse]:

        file_data = list(map(
            lambda x: ('files', (x.file_name, x.contents, x.content_type)),
            files))

        r = client.post(
            f"{api_base}/upload/store",
            files=file_data,
            headers=auth_headers)
        assert_status_code(r, HTTPStatus.OK)
        o = munchify(r.json())
        assert len(o.files) == len(files)

        # resolve and update the test files based on the response
        response_files_by_id: dict[UUID, FileUploadResponse] = {i.file_id: FileUploadResponse(**i) for i in o.files}
        request_files_by_hash = {i.content_hash: i for i in files}
        for f in response_files_by_id.values():
            test_file = request_files_by_hash[f.content_hash]
            test_file.file_id = f.file_id

            # validate
            assert f.event_ids is not None
            assert len(f.event_ids) > 0
            assert f.file_name == test_file.file_name
            assert f.content_type == test_file.content_type
            assert f.size == test_file.size

            # read back validation
            r = client.get(
                f"{api_base}/files/{f.file_id}",
                headers=auth_headers)
            assert_status_code(r, HTTPStatus.OK)
            o = munchify(r.json())
            assert UUID(o.file_id) == f.file_id
            assert UUID(o.owner) == profile_id
            assert o.content_hash == test_file.content_hash
            assert o.file_name == test_file.file_name
            assert o.size == len(test_file.contents)

            # read back by hash validation
            o = munchify(client.get(
                f"{api_base}/files/by_content/{test_file.content_hash}",
                headers=auth_headers).json())
            assert o.content_hash == test_file.content_hash

        # check the profiles pending uploads
        results = client.get(
            f"{api_base}/upload/pending",
            headers=auth_headers).json()
        assert len(results) > 0
        for r in results:
            o = munchify(r)
            test_file = request_files_by_hash[o.content_hash]
            assert UUID(o.file_id) == test_file.file_id

            # validate download info API
            r = client.get(
                f"{api_base}/download/info/{o.file_id}")
            assert_status_code(r, HTTPStatus.OK)
            o = munchify(r.json())
            assert UUID(o.file_id) == test_file.file_id
            assert o.content_hash == test_file.content_hash
            assert o.size == test_file.size
            assert o.name == test_file.file_name
            assert o.url is not None

            # validate download redirect API
            r = client.get(
                f"{api_base}/download/{o.file_id}",
                follow_redirects=False)
            assert_status_code(r, HTTPStatus.TEMPORARY_REDIRECT)
            assert (r.headers.get('Location') is not None)
        return response_files_by_id

    return _uploader
