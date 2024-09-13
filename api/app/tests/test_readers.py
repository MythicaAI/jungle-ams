from http import HTTPStatus
from itertools import cycle
from uuid import uuid4

from munch import munchify

from auth.api_id import event_seq_to_id, file_seq_to_id
from streaming.client_ops import ReadClientOp
from streaming.models import Event, File, Message, Progress
from streaming.source_types import create_source
from tests.fixtures.app import use_test_source_fixture
from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code


def generate_stream_items(item_list_length: int):
    """Generate a list of stream items"""
    generators = [
        lambda: Progress(progress=42),
        lambda: Message(message="foo"),
        lambda: File(file_id=file_seq_to_id(42)),
        lambda: Event(event_id=event_seq_to_id(42), payload={'hello': 'world'})
    ]
    gen_cycle = cycle(generators)
    return [next(gen_cycle) for i in range(item_list_length)]


def test_source_fixture(use_test_source_fixture):
    progress = Progress(
        typ='progress',
        correlation=str(uuid4()),
        progress=42)
    use_test_source_fixture['foo'] = [progress]
    source = create_source('test', {'name': 'foo', 'max_items': 1})
    items = source('0', 1)
    assert len(items) == 1
    assert type(items[0]) == Progress
    assert items[0].progress == 42
    items = source('1', 1)
    assert len(items) == 0


def test_operations(api_base, client, create_profile, use_test_source_fixture):
    test_profile = create_profile()
    auth_header = test_profile.authorization_header()

    # enumerate readers, empty result
    r = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 0

    # create 3 readers, start one from an advanced position
    create_count = 3
    item_list_length = 10
    for i in range(create_count):
        # populate the test readers item directly
        items = generate_stream_items(item_list_length)
        source_name = f'test-reader-{i}'
        use_test_source_fixture[source_name] = items

        # create the backing reader
        data = {
            'source': 'test',
            'name': source_name,
            'params': {'max_page_size': 1},
        }
        r = client.post(f"{api_base}/readers/", json=data, headers=auth_header)
        assert_status_code(r, HTTPStatus.CREATED)

    # enumerate readers
    r = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == create_count
    for reader in r.json():
        o = munchify(reader)
        r = client.websocket_connect(
            f"{api_base}/readers/{o.reader_id}",
            timeout=3,  # TODO: this doesn't work
            headers=auth_header)
        header = r.receive_json(mode="text")
        r.send_json(ReadClientOp().model_dump())
        assert header is not None

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
    r = client.websocket_connect(f"{api_base}/readers/{o.reader_id}", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    header = r.receive_json(mode="text")
