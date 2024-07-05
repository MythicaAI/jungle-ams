from http import HTTPStatus
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from munch import munchify

from db.schema.profiles import Org, OrgRef
from main import app
from routes.orgs.orgs import OrgCreateResponse
from routes.responses import FileUploadResponse, ProfileResponse, SessionStartResponse
from tests.shared_test import assert_status_code, FileContentTestObj, ProfileTestObj


@pytest.fixture
def create_profile(client: TestClient, api_base: str):
    """factory fixture, returns profile creation function"""

    def _create_profile(
            name: str = "test-profile",
            email: str = "test@test.com",
            full_name: str = "Test Profile",
            signature: str = 32 * 'X',
            description: str = "Test description",
            profile_href: str = "https://nothing.com/") -> ProfileTestObj:
        r = client.post(f"{api_base}/profiles",
                        json={
                            'name': name,
                            'email': email,
                            'full_name': full_name,
                            'signature': signature,
                            'description': description,
                            'profile_base_href': profile_href, })
        assert_status_code(r, HTTPStatus.CREATED)
        profile = ProfileResponse(**r.json())
        assert profile.name == name
        assert profile.description == description
        assert profile.signature == signature
        assert profile.profile_base_href == profile_href
        profile_id = profile.id

        # validate existence
        r = client.get(f"{api_base}/profiles/{profile_id}")
        assert_status_code(r, HTTPStatus.OK)
        profile = ProfileResponse(**r.json())
        assert profile.name == name
        assert profile.id == profile_id

        # Start session
        r = client.get(f"{api_base}/profiles/start_session/{profile_id}")
        assert_status_code(r, HTTPStatus.OK)
        session_response = SessionStartResponse(**r.json())
        assert session_response.profile.id == profile_id
        assert len(session_response.sessions) > 0
        assert len(session_response.token) > 0
        auth_token = session_response.token

        return ProfileTestObj(
            profile=profile,
            session=session_response.sessions[0],
            auth_token=auth_token)

    return _create_profile


@pytest.fixture(scope='session')
def api_base() -> str:
    """Return the current api base"""
    return "/api/v1"


@pytest.fixture(scope='module')
def client() -> TestClient:
    """Return a test client for the test module scope"""
    return TestClient(app)


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


@pytest.fixture(scope='module')
def create_org(client: TestClient, api_base):
    """Factory fixture for creating orgs"""

    def _create_org(test_profile: ProfileTestObj) -> OrgCreateResponse:
        headers = test_profile.authorization_header()
        test_org_name = 'test-org'
        test_org_description = 'test org description'

        r = client.post(f"{api_base}/orgs",
                        json={
                            'name': test_org_name,
                            'description': test_org_description},
                        headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        org = Org.model_validate(obj=r.json()['org'])
        admin = OrgRef.model_validate(obj=r.json()['admin'])
        org_resp = OrgCreateResponse(org=org, admin=admin)
        assert org_resp.org is not None
        assert org_resp.admin is not None

        org = Org.model_validate(obj=org_resp.org.model_dump(), strict=True)
        admin = OrgRef.model_validate(obj=org_resp.admin.model_dump(), strict=True)

        assert org.name == test_org_name
        assert org.description == test_org_description
        assert org.created is not None
        assert org.updated is None
        assert admin.profile_id == test_profile.profile.id
        assert admin.org_id == org_resp.org.id
        assert admin.role == 'admin'
        return OrgCreateResponse(org=org, admin=admin)

    return _create_org
