# pylint: disable=redefined-outer-name, unused-import

import asyncio
import itertools
import json
import random
import hashlib

from http import HTTPStatus
from itertools import cycle
from string import ascii_lowercase
from uuid import uuid4

from munch import munchify
import pytest
from sqlmodel import insert
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
from routes.readers.manager import redis_client
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
    with get_session() as session:
        for e in db_events:
            session.exec(insert(DbEvent).values(e))
        session.commit()


@pytest.mark.asyncio
async def test_websocket(
    api_base, client, create_profile, use_test_source_fixture, request_to_upload_files
):
    test_profile = create_profile()
    auth_header = test_profile.authorization_header()
    max_page = 2
    stream_items = list()

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
            'params': {'page_size': max_page},
        }
        r = client.post(f"{api_base}/readers/", json=data, headers=auth_header)
        assert_status_code(r, HTTPStatus.CREATED)
        # last_reader: ReaderResponse = munchify(r.json())
        stream_items.append(items)

    # socket_data = ReadClientOp(op='READ', page_size=max_page).model_dump()

    # enumerate readers
    readers = client.get(f"{api_base}/readers/", headers=auth_header)
    assert_status_code(readers, HTTPStatus.OK)
    assert len(readers.json()) == create_count
    # for reader in readers.json():
    #     o = munchify(reader)

    with client.websocket_connect(
        f"{api_base}/readers/connect", headers=auth_header
    ) as websocket:
        websocket: WebSocketTestSession

        await asyncio.sleep(1)

        for orig_items in stream_items:

            output_data = websocket.receive_json()
            output_data = json.loads(output_data)

            assert output_data is not None
            orig_items_page: list[StreamItemUnion] = orig_items[:max_page]

            orig_items_page = [i.model_dump() for i in orig_items_page]
            for output_item in output_data:
                for item in orig_items_page:
                    if output_item["correlation"] == item["correlation"]:
                        assert output_item == item

        # check the job has not been marked as completed
        for reader in readers.json():
            o = munchify(reader)
            reader_id = o.reader_id
            profile_readers_name = f"reader_job_{reader_id_to_seq(reader_id)}_status"
            assert not redis_client.get(profile_readers_name)

        # Upload files to trigger the Listener on an event
        files = [
            FileContentTestObj(
                file_name=test_file_name,
                file_id=str(file_id),
                contents=test_file_contents,
                content_hash=hashlib.sha1(test_file_contents).hexdigest(),
                content_type=test_file_content_type,
                size=len(test_file_contents),
            )
            for file_id in range(2)
        ]
        files = request_to_upload_files(auth_header, files)
        await asyncio.sleep(1)

        # check the job has been marked as completed
        for reader in readers.json():
            o = munchify(reader)
            reader_id = o.reader_id
            profile_readers_name = f"reader_job_{reader_id_to_seq(reader_id)}_status"
            assert "1" == redis_client.get(profile_readers_name)
