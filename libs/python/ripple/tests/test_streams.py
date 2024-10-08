# pylint: disable=redefined-outer-name, unused-import
import sys
print(sys.path)

import itertools
from itertools import cycle
from uuid import uuid4
import ripple as r
print(r)
import ripple.sources as rs
print(rs)
from ripple.sources.memory import create_memory_source

from cryptid.cryptid import event_seq_to_id, file_seq_to_id, job_seq_to_id
from ripple.funcs import Boundary
from ripple.models.streaming import Event, Message, OutputFiles, Progress

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


def test_source_fixture():
    progress = Progress(
        item_type='progress',
        correlation=str(uuid4()),
        process_guid=str(uuid4()),
        job_id=job_seq_to_id(1),
        progress=42)

    source = create_memory_source([progress], {'name': 'foo', 'max_items': 1})
    items = source(Boundary())
    assert len(items) == 1
    assert type(items[0]) == Progress
    assert items[0].progress == 42
    items = source(Boundary(position="1"))
    assert len(items) == 0
