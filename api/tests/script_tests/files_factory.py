import hashlib
from http import HTTPStatus
import httpx
from munch import munchify

from tests.shared_test import FileContentTestObj, ProfileTestObj


test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_type = "application/octet-stream"


async def upload_files(test_profile: ProfileTestObj, api_base, files_count: int, timeout: int):
    async with httpx.AsyncClient() as client:
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
            for file_id in range(files_count)
        ]

        files = [
            ('files', (file.file_name, file.contents, file.content_type))
            for file in files
        ]

        upload_res = await client.post(
            f"{api_base}/upload/store", files=files, headers=headers, timeout=timeout
        )
        assert upload_res, HTTPStatus.OK
        upload_res = munchify(upload_res.json())
        assert len(upload_res.files) == len(files)

        return (i.file_id for i in upload_res.files)
