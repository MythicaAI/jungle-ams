# pylint: disable=redefined-outer-name, unused-import

import itertools
import json
import logging
import pytest
import random
from fastapi.testclient import TestClient
from itertools import cycle
from sqlmodel import insert, select
from starlette.testclient import WebSocketTestSession
from string import ascii_lowercase
from uuid import uuid4

from cryptid.cryptid import (
    event_seq_to_id,
    file_seq_to_id,
    job_seq_to_id,
    profile_id_to_seq,
)
from db.connection import get_session
from db.schema.events import Event as DbEvent
from db.schema.profiles import Profile
from ripple.client_ops import ReadClientOp
from ripple.models.streaming import (
    Event,
    Message,
    OutputFiles,
    Progress,
)
from tests.fixtures.app import use_test_source_fixture
from tests.fixtures.create_profile import create_profile
from tests.shared_test import ProfileTestObj

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


def generate_events(profile: Profile, event_count: int):
    """Generate some random event data in the database"""

    def generate_test_job_data():
        """Build some random event payload"""
        return {
            'info': ''.join(
                [random.choice(ascii_lowercase) for _ in range(test_event_info_len)]
            )
        }

    db_events = [
        {
            'event_type': 'test',
            'job_data': generate_test_job_data(),
            'owner_seq': profile_id_to_seq(profile.profile_id),
        }
        for _ in range(event_count)
    ]
    events = []
    with get_session() as session:
        for e in db_events:
            events.append(session.exec(insert(DbEvent).values(e)))
        session.commit()
    return [event.inserted_primary_key[0] for event in events]


def get_event_dumped_models(events_ids):
    with get_session() as session:
        statement = (
            select(DbEvent)
            .where(DbEvent.event_seq.in_(events_ids))  # pylint: disable=no-member
            .order_by(DbEvent.event_seq)
        )
        events = session.exec(statement).all()
    return [
        Event(
            index=event_seq_to_id(i.event_seq),
            payload=i.job_data,
        ).model_dump()
        for i in events
    ]


@pytest.mark.asyncio
async def test_websocket(
        api_base,
        client: TestClient,
        create_profile,
        use_test_source_fixture,  # pylint: disable=unused-argument
):
    test_profile: ProfileTestObj = create_profile()
    auth_header = test_profile.authorization_header()

    page_size = 3
    item_list_length = 10
    generate_event_count = 10

    # generate the test data
    events_ids = generate_events(test_profile.profile, generate_event_count)
    stream_items = get_event_dumped_models(events_ids)

    # find active readers
    r = client.post(
        f"{api_base}/readers/",
        json={'source': 'events', 'params': {'page_size': page_size}},
        headers=auth_header,
    )
    reader = r.json()
    assert "reader_id" in reader
    reader_id = reader["reader_id"]

    # make the auth header a cookie for the connection
    client.cookies.update(auth_header)

    with client.websocket_connect(
            f"{api_base}/readers/connect", data={"body": {}}
    ) as websocket:
        websocket: WebSocketTestSession

        max_reads = (item_list_length / page_size) + 1

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
                for output_raw in output_data:
                    log.info("expected output_data %s", stream_items[count_events])
                    raw: dict = json.loads(output_raw)
                    assert 'index' in raw
                    assert 'payload' in raw
                    assert raw["index"] == stream_items[count_events]["index"]
                    count_events += 1

            assert page_sized_reads == int(
                generate_event_count / page_size
            ), "full pages read constraint"
            assert count_events == generate_event_count, "total events read constraint"

        # read the current stream items
        check_new_items_in_connection(page_size, generate_event_count, stream_items)

        # cache off old items
        old_stream_items = list(stream_items)

        # Trigger new events to fetch the latest data
        events_ids = generate_events(test_profile.profile, generate_event_count)
        stream_items = get_event_dumped_models(events_ids)

        # get the next set
        check_new_items_in_connection(page_size, generate_event_count, stream_items)

        # Do a raw read operation
        data_without_op = ReadClientOp().model_dump()
        data_without_op["reader_id"] = reader_id
        del data_without_op["op"]
        websocket.send_json(data_without_op)
        output_data = websocket.receive_json()
        assert output_data is not None
        log.info("Received output_data %s", output_data)
        assert {'error': "No 'op' included in client message"} == output_data

        # Test an invalid operation
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

        send_data = ReadClientOp(
            position=new_old_stream_items[(first_item_position - 1)][
                "index"
            ]  # Adjusted to "first_item_position - 1" since the reader reads after its current position
        ).model_dump()

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
