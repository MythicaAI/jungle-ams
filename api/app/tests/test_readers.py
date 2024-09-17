# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus
from itertools import cycle
from uuid import uuid4

from munch import munchify

from auth.api_id import event_seq_to_id, file_seq_to_id
from routes.readers.manager import redis_client
from routes.readers.schemas import ReaderResponse
from streaming.client_ops import ReadClientOp
from streaming.models import Event, File, Message, Progress, StreamItem
from streaming.source_types import create_source
from tests.fixtures.app import use_test_source_fixture
from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code


def generate_stream_items(item_list_length: int):
    """Generate a list of stream items"""
    generators = [
        lambda: Progress(typ='progress',correlation=str(uuid4()),progress=42),
        lambda: Message(typ='message',correlation=str(uuid4()), message="foo"),
        lambda: File(typ='file',correlation=str(uuid4()), file_id=file_seq_to_id(42)),
        lambda: Event(typ='event',correlation=str(uuid4()), event_id=event_seq_to_id(42), payload={'hello': 'world'})
    ]
    gen_cycle = cycle(generators)
    # as TestSource.__call__() imitates already fetched and paginated StreamItems
    # lambda functions "next(gen_cycle)()" should be called
    return [next(gen_cycle)() for i in range(item_list_length)]


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
    max_page = 2

    # enumerate readers, empty result
    r = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == 0

    # create 3 readers, start one from an advanced position
    create_count = 3
    item_list_length = 10
    stream_items = dict()
    for i in range(create_count):
        # populate the test readers item directly
        items = generate_stream_items(item_list_length)
        source_name = f'test-reader-{i}'
        use_test_source_fixture[source_name] = items

        # create the backing reader
        data = {
            'source': 'test',
            'name': source_name,
            'params': {'max_page_size': max_page},
        }
        r = client.post(f"{api_base}/readers/", json=data, headers=auth_header)
        assert_status_code(r, HTTPStatus.CREATED)
        last_reader: ReaderResponse = munchify(r.json())
        stream_items[last_reader['reader_id']] = items

    socket_data = ReadClientOp(op='READ', max_page=max_page).model_dump()

    # enumerate readers
    r = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == create_count
    for reader in r.json():
        o = munchify(reader)
        with client.websocket_connect(
                f"{api_base}/readers/{o.reader_id}/connect",
                headers=auth_header
        ) as websocket:
            websocket.send_json(socket_data)
            header = websocket.receive_json()
            assert header is not None
            
            # Set the redis job is completed
            reader_job_name = f"reader_job_{o.owner_id}_completed"
            redis_client.set(reader_job_name, "1")
            
            items: list[StreamItem] = stream_items[o['reader_id']][:max_page]
            websocket.send_json(socket_data)
            header = websocket.receive_json()
            assert header == [i.model_dump() for i in items]

    # delete a reader
    o = munchify(r.json()[1])
    r = client.delete(f"{api_base}/readers/{o.reader_id}", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
