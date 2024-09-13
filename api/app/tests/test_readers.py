from http import HTTPStatus

from munch import munchify

from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code


def test_operations(api_base, client, create_profile):
    test_profile = create_profile()
    auth_header = test_profile.authorization_header()

    # enumerate readers, empty result
    r = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 0

    # create some test streams sources

    # create 3 readers, start one from an advanced position
    create_count = 3
    for i in range(create_count):
        data = {
            'source': 'test_sink',
            'name': f'test-reader-{i}'
        }
        r = client.post(f"{api_base}/readers/", json=data, headers=auth_header)
        assert_status_code(r, HTTPStatus.CREATED)

    # enumerate readers
    r = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == create_count

    # delete a reader
    o = munchify(r.json()[1])
    r = client.delete(f"{api_base}/readers/{o.reader_id}", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)

    # enumerate readers
    r = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == create_count - 1
    reader_ids = {r['reader_id'] for r in r.json()}
    assert o.reader_id not in reader_ids

    # assert reader picks up at place
