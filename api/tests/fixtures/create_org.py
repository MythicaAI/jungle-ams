from http import HTTPStatus

import pytest
from meshwork.auth import roles

from routes.orgs.orgs import OrgRefResponse
from tests.shared_test import ProfileTestObj, assert_status_code


@pytest.fixture(scope='module')
def create_org(client, api_base):
    """Factory fixture for creating orgs"""

    def _create_org(test_profile: ProfileTestObj) -> OrgRefResponse:
        headers = test_profile.authorization_header()
        test_org_name = 'test-org'
        test_org_description = 'test org description'

        r = client.post(f"{api_base}/orgs",
                        json={
                            'name': test_org_name,
                            'description': test_org_description},
                        headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        org_resp = OrgRefResponse(**r.json())
        assert org_resp.org_id is not None
        assert org_resp.org_name is not None
        assert org_resp.profile_id is not None
        assert org_resp.profile_id == test_profile.profile.profile_id
        assert org_resp.profile_name is not None
        assert org_resp.org_name == test_org_name
        assert org_resp.description == test_org_description
        assert org_resp.created is not None
        assert org_resp.role == roles.alias_org_admin
        return org_resp

    return _create_org
