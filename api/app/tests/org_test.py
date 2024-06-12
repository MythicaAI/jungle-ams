from http import HTTPStatus
from fastapi.testclient import TestClient
from munch import munchify

from .profile_test import ProfileTestInfo
from .shared_test import api_base


def create_org(client: TestClient, profile_test_info: ProfileTestInfo):
    headers = profile_test_info.authorization_header()
    test_org_name = 'test-org'
    test_org_description = 'test org description'

    r = client.post(f"{api_base}/orgs",
                    json={
                        'name': test_org_name,
                        'description': test_org_description},
                    headers=headers)
    assert r.status_code == HTTPStatus.CREATED
    o = munchify(r.json())
    assert o.org is not None
    assert o.admin is not None
    assert o.org.name == test_org_name
    assert o.org.description == test_org_description
    assert o.org.created is not None
    assert o.org.updated is None
    assert o.admin.profile_id == profile_test_info.profile.id
    assert o.admin.org_id == o.org.id
    assert o.admin.role == 'admin'
    return o
