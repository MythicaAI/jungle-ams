# pylint: disable=redefined-outer-name, unused-import

import itertools
from http import HTTPStatus

from munch import munchify

from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code, get_random_string

# length of event data in test events
test_event_info_len = 10
next_test_event_id = itertools.count(start=1, step=1)


def test_operations(api_base, client, create_profile):
    test_profile = create_profile()
    profile = test_profile.profile
    headers = test_profile.authorization_header()

    # enumerate readers, empty result
    r = client.get(f"{api_base}/readers/", headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 0

    # create org to contain assets
    org_name = 'org-' + get_random_string(10, digits=False)
    r = client.post(f"{api_base}/orgs/", json={'name': org_name}, headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    org_id = o.org_id

    # create asset in org
    r = client.post(f"{api_base}/assets", json={'org_id': org_id}, headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    asset_id = o.asset_id

    # create tag
    tag_name = "tag_" + get_random_string(10, digits=False)
    r = client.post(f"{api_base}/tags", json={'name': tag_name}, headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o.name == tag_name
    assert o.owner_id == profile.profile_id
    tag_id = o.tag_id

    # create tag for asset
    r = client.post(
        f"{api_base}/tags/asset",
        json={'tag_id': tag_id, "type_id": asset_id},
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())

    # delete tag
    r = client.delete(f"{api_base}/tags/{tag_name}", headers=headers)
    assert_status_code(r, HTTPStatus.OK)
