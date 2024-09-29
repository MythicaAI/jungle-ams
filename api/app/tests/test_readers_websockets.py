# pylint: disable=redefined-outer-name, unused-import

import asyncio
import itertools
import json
import logging
import random

from itertools import cycle
from string import ascii_lowercase
from uuid import uuid4

from fastapi.testclient import TestClient
import pytest
from sqlmodel import insert, select
from starlette.testclient import WebSocketTestSession

from auth.api_id import (
    event_seq_to_id,
    file_seq_to_id,
    job_seq_to_id,
    profile_id_to_seq,
)
from db.connection import get_session
from db.schema.events import Event as DbEvent
from db.schema.profiles import Profile
from streaming.models import (
    Event,
    Message,
    OutputFiles,
    Progress,
    StreamItemUnion,
)
from tests.fixtures.app import use_test_source_fixture
from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import request_to_upload_files
from tests.shared_test import FileContentTestObj, assert_status_code
from auth.api_id import reader_id_to_seq

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
            .where(DbEvent.event_seq.in_(events_ids)) # pylint: disable=no-member
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
    test_profile = create_profile()
    auth_header = test_profile.authorization_header()

    # create 3 readers, start one from an advanced position
    item_list_length = 10

    generate_event_count = 10
    events_ids = generate_events(test_profile.profile, generate_event_count)
    stream_items = get_event_dumped_models(events_ids)

    # create event reader
    page_size = 3
    client.post(
        f"{api_base}/readers/",
        json={'source': 'events', 'params': {'page_size': page_size}},
        headers=auth_header,
    )

    with client.websocket_connect(
        f"{api_base}/readers/connect", headers=auth_header, data={"body": {}}
    ) as websocket:
        websocket: WebSocketTestSession

        await asyncio.sleep(1)

        max_reads = item_list_length / page_size
        
        def check_new_items_in_connection():
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
                    raw: dict = json.loads(output_raw)
                    assert 'index' in raw
                    assert 'payload' in raw
                    assert raw["index"] == stream_items[count_events]["index"]
                    count_events += 1

            assert page_sized_reads == int(
                generate_event_count / page_size
            ), "full pages read constraint"
            assert count_events == generate_event_count, "total events read constraint"
        
        check_new_items_in_connection()
        
        # Maintain WebSocket connection and trigger new events to fetch the latest data
        events_ids = generate_events(test_profile.profile, generate_event_count)
        stream_items = get_event_dumped_models(events_ids)

        check_new_items_in_connection()
