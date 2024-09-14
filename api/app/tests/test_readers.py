from http import HTTPStatus
from itertools import cycle
from uuid import uuid4

from munch import munchify
from pydantic import TypeAdapter

from auth.api_id import event_seq_to_id, file_seq_to_id, job_seq_to_id
from streaming.models import Event, Message, OutputFiles, Progress, StreamItemUnion, StreamModelTypes
from streaming.source_types import create_source
from tests.fixtures.app import use_test_source_fixture
from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code


def generate_stream_items(item_list_length: int):
    """Generate a list of stream items"""
    process_guid = str(uuid4())
    job_id = job_seq_to_id(1)
    generators = [
        lambda: Progress(process_guid=process_guid, job_id=job_id, progress=42),
        lambda: Message(process_guid=process_guid, job_id=job_id, message="foo"),
        lambda: OutputFiles(process_guid=process_guid, job_id=job_id, files={'meshes': [file_seq_to_id(42)]}),
        lambda: Event(event_id=event_seq_to_id(42), payload={'hello': 'world'})
    ]
    gen_cycle = cycle(generators)
    return [next(gen_cycle)() for i in range(item_list_length)]


def test_source_fixture(use_test_source_fixture):
    progress = Progress(
        item_type='progress',
        correlation=str(uuid4()),
        process_guid=str(uuid4()),
        job_id=job_seq_to_id(1),
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
    reader_names = set()
    for i in range(create_count):
        # populate the test readers item directly
        items = generate_stream_items(item_list_length)
        reader_name = f'test-reader-{i}'
        use_test_source_fixture[reader_name] = items
        reader_names.add(reader_name)

        # create the backing reader
        data = {
            'source': 'test',
            'name': reader_name,
            'params': {'max_page_size': 1},
        }
        r = client.post(f"{api_base}/readers/", json=data, headers=auth_header)
        assert_status_code(r, HTTPStatus.CREATED)

    # enumerate readers
    readers = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(readers, HTTPStatus.OK)
    assert len(readers.json()) == create_count
    for reader in readers.json():
        o = munchify(reader)
        items = client.get(f"{api_base}/readers/{o.reader_id}/items", headers=auth_header)
        assert_status_code(items, HTTPStatus.OK)
        assert len(items.json()) == item_list_length
        for i in items.json():
            assert 'correlation' in i
            assert 'item_type' in i
        adapter = TypeAdapter(list[StreamItemUnion])
        items = adapter.validate_python(items.json())
        for item in items:
            assert type(item) in StreamModelTypes
            model_dict = item.model_dump()
            if type(item) == OutputFiles:
                assert 'files' in model_dict
                assert 'process_guid' in model_dict
                assert 'job_id' in model_dict
                assert 'correlation' in model_dict
                assert 'meshes' in model_dict['files']
            if type(item) == Progress:
                assert 'progress' in model_dict
                assert int(model_dict['progress']) == 42

    # delete a reader
    o = munchify(readers.json()[1])
    r = client.delete(f"{api_base}/readers/{o.reader_id}", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)

    # make sure the items are not readable
    r = client.get(f"{api_base}/readers/{o.reader_id}/items", headers=auth_header)
    assert_status_code(r, HTTPStatus.NOT_FOUND)

    # enumerate readers
    r = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == create_count - 1
    reader_ids = {r['reader_id'] for r in r.json()}
    assert o.reader_id not in reader_ids
