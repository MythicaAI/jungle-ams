"""Test suite for workers interacting with job system"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from munch import munchify

from routes.workers.models import WorkerAdvertisement
from tests.fixtures.create_asset_versions import create_asset_versions
from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import uploader
from tests.shared_test import ProfileTestObj, assert_status_code
from tests.test_jobs import create_interactive_job_def, create_job_def


@pytest.mark.asyncio
async def test_interactive(client: TestClient, api_base, create_profile, create_asset_versions, uploader):
    test_profile: ProfileTestObj = await create_profile()
    headers = test_profile.authorization_header()
    r = await create_job_def(client, api_base, headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert 'job_def_id' in o
    assert 'interactive' in o
    assert not o.interactive

    r = await create_interactive_job_def(client, api_base, headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert 'interactive' in o
    assert not o.interactive
    job_def_id = o.job_def_id
    worker_id = "worker_123456789"

    # TODO: test bus messages

    # advertise a new worker
    worker_endpoint = f'ws://localhost:8765/'
    advert = WorkerAdvertisement(
        controller_id=str(uuid4()),
        worker_id=None,
        job_count=0,
        job_capacity=3,
        ws_client_endpoint=worker_endpoint,
    )
    r = client.post(
        f'{api_base}/workers/advertise', json=advert.model_dump())
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())

    assert o.worker_id == worker_id

    # create new interactive job
    r = client.post(f'{api_base}/jobs',
                    json={
                        'job_def_id': job_def_id,
                        'interactive': True,
                        'params': {
                            'size': 5.0
                        }
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert o.job_id
    job_id = o.job_id

    # find a worker connection for the job
    r = client.get(f'{api_base}/workers/connect/{job_id}')
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o.worker_id == worker_id
    assert o.ws_client_endpoint == advert.ws_client_endpoint.format(worker_id=worker_id)
