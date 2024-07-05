# pytest disable=redefined-outer-name

from http import HTTPStatus

import pytest

from db.schema.profiles import OrgRef, Org
from routes.orgs.orgs import OrgCreateResponse
from tests.shared_test import ProfileTestObj, assert_status_code


@pytest.fixture(scope='module')
def create_org(client, api_base):
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
