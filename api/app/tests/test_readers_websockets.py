# pylint: disable=redefined-outer-name, unused-import

import asyncio
import itertools
import logging
import random
from http import HTTPStatus
from itertools import cycle
from string import ascii_lowercase
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from starlette.testclient import WebSocketTestSession

from cryptid.cryptid import (
    event_seq_to_id,
    file_seq_to_id,
    job_seq_to_id,
    profile_id_to_seq,
)
from profiles.responses import ProfileResponse
from ripple.client_ops import ReadClientOp
from ripple.models.streaming import (
    Event,
    Message,
    OutputFiles,
    Progress,
)
from tests.fixtures.app import use_test_source_fixture
from tests.fixtures.create_profile import create_profile
from tests.shared_test import ProfileTestObj, assert_status_code

# length of event data in test events
test_event_info_len = 10
next_test_event_id = itertools.count(start=1, step=1)
test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_type = "application/octet-stream"

log = logging.getLogger(__name__)


def generate_stream_items(item_list_length: int):
    """Generate a list of stream items"""
    process_guid = str(uuid4())
    job_id = job_seq_to_id(1)
    generators = [
        lambda: Progress(process_guid=process_guid, job_id=job_id, progress=42),
        lambda: Message(process_guid=process_guid, job_id=job_id, message="foo"),
        lambda: OutputFiles(
            process_guid=process_guid,
            job_id=job_id,
            files={'meshes': [file_seq_to_id(42)]},
        ),
        lambda: Event(
            index=event_seq_to_id(next(next_test_event_id)), payload={'hello': 'world'}
        ),
    ]
    gen_cycle = cycle(generators)
    return [next(gen_cycle)() for i in range(item_list_length)]


def generate_events(api_base: str, client: TestClient, profile: ProfileResponse, event_count: int):
    """Generate some random event data in the database"""

    def generate_test_job_data():
        """Build some random event payload"""
        return {
            'info': ''.join(
                [random.choice(ascii_lowercase) for _ in range(test_event_info_len)]
            )
        }

    events_json = [
        {
            'event_type': 'test',
            'job_data': generate_test_job_data(),
            'owner_seq': profile_id_to_seq(profile.profile_id),
        }
        for _ in range(event_count)
    ]
    r = client.post(f"{api_base}/test/events", json=events_json)
    assert_status_code(r, HTTPStatus.CREATED)
    return r.json()


def get_event_dumped_models(api_base, client, events_ids):
    """Get database """
    r = client.post(f"{api_base}/test/events/multiple", json={'event_ids': events_ids})
    assert_status_code(r, HTTPStatus.OK)
    return [Event(payload=e['job_data'], index=event_seq_to_id(e['event_seq'])) for e in r.json()]


@pytest.mark.asyncio
async def test_websocket(
        api_base: str,
        client: TestClient,
        create_profile,
        use_test_source_fixture,  # pylint: disable=unused-argument
):
    test_profile: ProfileTestObj = await create_profile()
    auth_header = test_profile.authorization_header()

    item_list_length = 10

    generate_event_count = 10
    events_ids = generate_events(api_base, client, test_profile.profile, generate_event_count)
    stream_items = get_event_dumped_models(api_base, client, events_ids)

    page_size = 3
    r = client.post(
        f"{api_base}/readers/",
        json={'source': 'events', 'params': {'page_size': page_size}},
        headers=auth_header,
    )
    reader = r.json()
    assert "reader_id" in reader
    reader_id = reader["reader_id"]

    client.cookies.update(auth_header)
    with client.websocket_connect(
            f"{api_base}/readers/connect", data={"body": {}}
    ) as websocket:
        websocket: WebSocketTestSession

        await asyncio.sleep(0.1)

        max_reads = item_list_length / page_size

        def check_new_items_in_connection(
                page_size, generate_event_count, stream_items
        ):
            reads = 0
            page_sized_reads = 0
            count_events = 0
            while reads < max_reads:
                reads += 1
                output_data = websocket.receive_json()
                assert output_data is not None
                log.info("Received output_data %s", output_data)
                if len(output_data) == page_size:
                    page_sized_reads += 1
                if 'error' in output_data:
                    assert False, f"Error in output data: {output_data['error']}"
                for o in output_data:
                    log.info("expected output_data %s", stream_items[count_events])
                    assert 'index' in o
                    assert 'payload' in o
                    assert o["index"] == stream_items[count_events].index
                    count_events += 1

            assert page_sized_reads == int(
                generate_event_count / page_size
            ), "full pages read constraint"
            assert count_events == generate_event_count, "total events read constraint"

        check_new_items_in_connection(page_size, generate_event_count, stream_items)
        old_stream_items = stream_items
        # Trigger new events to fetch the latest data
        events_ids = generate_events(api_base, client, test_profile.profile, generate_event_count)
        stream_items = get_event_dumped_models(api_base, client, events_ids)

        check_new_items_in_connection(page_size, generate_event_count, stream_items)

        data_without_op = ReadClientOp().model_dump()
        data_without_op["reader_id"] = reader_id
        del data_without_op["op"]
        websocket.send_json(data_without_op)
        output_data = websocket.receive_json()
        assert output_data is not None
        log.info("Received output_data %s", output_data)
        assert {'error': "No 'op' included in client message"} == output_data

        data_invalid_op = ReadClientOp().model_dump()
        data_invalid_op["reader_id"] = reader_id
        data_invalid_op["op"] = "1916846835184884"
        websocket.send_json(data_invalid_op)
        output_data = websocket.receive_json()
        assert output_data is not None
        log.info("Received output_data %s", output_data)
        assert {'error': "Invalid 'op' included in client message"} == output_data

        new_old_stream_items = old_stream_items + stream_items

        first_item_position = len(new_old_stream_items) // 4
        stream_items = new_old_stream_items[
                       first_item_position:
                       ]  # Start stream_items from the third quarter of all items
        item_list_length = len(stream_items)

        max_reads = item_list_length / page_size

        # Adjusted to "first_item_position - 1" since the reader reads after its current position
        send_data = ReadClientOp(position=new_old_stream_items[(first_item_position - 1)].index).model_dump()

        websocket.send_json(send_data)
        output_data = websocket.receive_json()
        assert output_data is not None
        log.info("Received output_data %s", output_data)
        assert {'error': "No 'reader_id' included in client message"} == output_data

        # Test with a new position
        send_data["reader_id"] = reader_id
        websocket.send_json(send_data)
        output_data = websocket.receive_json()
        assert output_data is not None
        log.info("Received output_data %s", output_data)
        assert {"success": "The processor is being updated"} == output_data

        check_new_items_in_connection(page_size, item_list_length, stream_items)
