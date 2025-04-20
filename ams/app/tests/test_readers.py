# pylint: disable=redefined-outer-name, unused-import

import itertools
import random
from http import HTTPStatus
from itertools import cycle
from string import ascii_lowercase
from uuid import uuid4

import pytest
from munch import munchify
from pydantic import TypeAdapter
from starlette.testclient import TestClient

from cryptid.cryptid import event_seq_to_id, file_seq_to_id, job_seq_to_id, profile_id_to_seq
from db.schema.profiles import Profile
from ripple.funcs import Boundary
from ripple.models.streaming import Event, Message, OutputFiles, Progress, StreamItemUnion, StreamModelTypes
from ripple.source_types import create_source
from tests.fixtures.app import use_test_source_fixture
from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code

# length of event data in test events
test_event_info_len = 10
next_test_event_id = itertools.count(start=1, step=1)


def generate_stream_items(item_list_length: int):
    """Generate a list of stream items"""
    process_guid = str(uuid4())
    job_id = job_seq_to_id(1)
    generators = [
        lambda: Progress(process_guid=process_guid, job_id=job_id, progress=42),
        lambda: Message(process_guid=process_guid, job_id=job_id, message="foo"),
        lambda: OutputFiles(process_guid=process_guid, job_id=job_id, files={'meshes': [file_seq_to_id(42)]}),
        lambda: Event(index=event_seq_to_id(next(next_test_event_id)), payload={'hello': 'world'})
    ]
    gen_cycle = cycle(generators)
    return [next(gen_cycle)() for i in range(item_list_length)]


def generate_events(api_base: str, client: TestClient, profile: Profile, event_count: int):
    """Generate some random event data in the database"""

    def generate_test_job_data():
        """Build some random event payload"""
        return {'info': ''.join([random.choice(ascii_lowercase) for _ in range(test_event_info_len)])}

    events_json = [{
        'event_type': 'test',
        'job_data': generate_test_job_data(),
        'owner_seq': profile_id_to_seq(profile.profile_id)}
        for _ in range(event_count)]
    r = client.post(f"{api_base}/test/events", json=events_json)
    assert_status_code(r, HTTPStatus.CREATED)


@pytest.mark.asyncio
async def test_source_fixture(use_test_source_fixture):
    progress = Progress(
        item_type='progress',
        correlation=str(uuid4()),
        process_guid=str(uuid4()),
        job_id=job_seq_to_id(1),
        progress=42)
    use_test_source_fixture['foo'] = [progress]
    source = create_source('test', {'name': 'foo', 'max_items': 1})
    items = [item async for item in source(Boundary())]
    assert len(items) == 1
    assert type(items[0]) == Progress
    assert items[0].progress == 42
    items = [item async for item in source(Boundary(position="1"))]
    assert len(items) == 0


@pytest.mark.asyncio
async def test_operations(api_base, client, create_profile, use_test_source_fixture):
    test_profile = await create_profile()
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
            'params': {'page_size': item_list_length},
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


@pytest.mark.asyncio
async def test_events(api_base, client, create_profile):
    test_profile = await create_profile()
    auth_header = test_profile.authorization_header()

    # generate some events for the profile
    generate_event_count = 10
    generate_events(api_base, client, test_profile.profile, generate_event_count)

    # create event reader
    page_size = 3
    r = client.post(f"{api_base}/readers/",
                    json={'source': 'events',
                          'params': {'page_size': page_size}},
                    headers=auth_header)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert 'reader_id' in o
    assert 'source' in o and o.source == 'events'

    reader_id = o.reader_id

    # dequeue events in page_size chunks
    count_events = 0
    max_reads = (generate_event_count / page_size) + 2
    reads = 0
    got_zero_read = False
    page_sized_reads = 0
    events = []
    event_ids = set()
    while reads < max_reads:
        reads += 1
        r = client.get(
            f"{api_base}/readers/{reader_id}/items",
            headers=auth_header)
        assert_status_code(r, HTTPStatus.OK)
        if len(r.json()) == 0:
            got_zero_read = True
            break
        if len(r.json()) == page_size:
            page_sized_reads += 1
        for i in r.json():
            count_events += 1
            e = munchify(i)
            assert 'index' in e
            assert 'payload' in e
            assert e.index not in event_ids, "unique read constraint failed"
            event_ids.add(e.index)
            events.append(e)
            payload = e.payload
            assert 'info' in payload
            assert len(payload.info) == test_event_info_len

    assert count_events == generate_event_count, "total events read constraint"
    assert got_zero_read, "reached end of stream constraint"
    assert page_sized_reads == int(generate_event_count / page_size), "full pages read constraint"

    # test the optional after parameter to see if the read works
    selected_event = events[generate_event_count - page_size]
    expected_next_event = events[generate_event_count - (page_size - 1)]
    after = selected_event.index
    r = client.get(
        f"{api_base}/readers/{reader_id}/items?after={after}",
        headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == page_size - 1, "partial page size constraint"
    assert r.json()[0]['index'] == expected_next_event.index, "after constraint"

    # test the optional before parameter
    selected_event = events[2]  # select items 0 and 1
    expected_next_event = events[0]
    before = selected_event.index
    r = client.get(
        f"{api_base}/readers/{reader_id}/items?before={before}",
        headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
    assert len(r.json()) == page_size - 1, "partial page size constraint"
    assert r.json()[0]['index'] == expected_next_event.index, "after constraint"

    # remove the reader
    r = client.delete(f"{api_base}/readers/{reader_id}", headers=auth_header)
    assert_status_code(r, HTTPStatus.OK)
