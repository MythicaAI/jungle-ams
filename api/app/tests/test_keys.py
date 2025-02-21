"""API key test cases"""

# pylint: disable=redefined-outer-name, unused-import

from datetime import datetime, timezone
from http import HTTPStatus

import pytest
from munch import munchify

from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code


@pytest.mark.asyncio
async def test_api_keys(client, api_base, create_profile):
    """This test generates a profile and a set of keys, it then removes
    a key and ensures that worked. Data is validated along the way"""
    profile = await create_profile()
    headers = profile.authorization_header()

    # ensure no keys
    r = client.get(f"{api_base}/keys", headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 0

    # create the keys and validate the responses
    key_count = 10
    key_values = set()
    for i in range(key_count):
        data = {'name': f"key-{i}"}
        if i % 2 == 0:
            data['description'] = f"description-{i}"

        r = client.post(f"{api_base}/keys/",
                        json=data,
                        headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        props = {'name', 'description', 'value', 'created', 'expires'}
        for p in props:
            assert p in o
            assert o.name is not None
            assert o.value is not None
            if i % 2 == 0:
                assert o.description is not None
        assert len(o.value) > 16
        now_utc = datetime.now(timezone.utc)
        assert datetime.fromisoformat(o.created) <= now_utc
        assert datetime.fromisoformat(o.expires) >= datetime.fromisoformat(o.created)
        key_values.add(o.value)

    # validate the list response
    assert len(key_values) == key_count
    r = client.get(f"{api_base}/keys", headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == key_count
    for v in r.json():
        o = munchify(v)
        assert o.value in key_values

    # delete a key
    remove = key_values.pop()
    r = client.delete(f"{api_base}/keys/{remove}", headers=headers)
    assert_status_code(r, HTTPStatus.OK)

    # revalidate the keys with the newly removed key
    r = client.get(f"{api_base}/keys", headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == len(key_values)
    for v in r.json():
        o = munchify(v)
        assert o.value in key_values
