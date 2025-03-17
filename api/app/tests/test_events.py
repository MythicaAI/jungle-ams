# pylint: disable=redefined-outer-name, unused-import

import hashlib
import random
from http import HTTPStatus
from string import ascii_lowercase

import pytest
from cryptid.cryptid import event_seq_to_id, job_seq_to_id, profile_id_to_seq
from fastapi.testclient import TestClient
from munch import munchify
from profiles.responses import ProfileResponse
from ripple.automation.models import (
    AutomationRequest,
    AutomationResult,
    CropImageRequest,
    EventAutomationResponse,
)
from ripple.models.params import (
    FileParameter,
    IntParameterSpec,
    ParameterSet,
    ParameterSpec,
)
from ripple.models.streaming import CropImageResponse, JobDefinition
from routes.events.models import EventUpdateResponse
from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import request_to_upload_files
from tests.shared_test import ProfileTestObj, assert_status_code

test_profile_name = "test-profile"
test_profile_description = "test-description"
test_profile_signature = 32 * 'X'
test_profile_tags = {"tag-a": "a", "tag-b": "b", "tag-c": "c"}
test_profile_href = "https://test.com/"
test_profile_full_name = "test-profile-full-name"
test_profile_email = "test@test.com"
test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_hash = hashlib.sha1(test_file_contents).hexdigest()
test_file_content_type = "application/octet-stream"
test_asset_name = 'test-asset'
test_asset_collection_name = 'test-collection'
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"

test_event_info_len = 10


def generate_events(
    api_base: str, client: TestClient, profile: ProfileResponse, event_count: int
):
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


@pytest.mark.asyncio
async def test_update_events_result_data(
    api_base,
    client: TestClient,
    create_profile,
):

    test_profile: ProfileTestObj = await create_profile()
    auth_header = test_profile.authorization_header()
    second_test_profile: ProfileTestObj = await create_profile()
    second_auth_header = second_test_profile.authorization_header()

    generate_event_count = 1

    data = EventAutomationResponse(
        is_bulk_processing=True,
        processed=True,
        request_result=[
            AutomationResult(
                processed=True,
                request=AutomationRequest(
                    process_guid="test-guid",
                    correlation="test-work",
                    results_subject=None,
                    job_id=None,
                    auth_token=test_profile.auth_token,
                    path="/test/path",
                    data=ParameterSet(
                        hda_file=FileParameter(file_id="file_id"),
                        src_asset_id="asset_id",
                        src_version=[1, 1, 1],
                    ).model_dump(),
                    telemetry_context={},
                    event_id="1",
                ),
                result=JobDefinition(
                    job_type="test_job",
                    job_def_id=job_seq_to_id(i),
                    name="Test Job",
                    description="Test Description",
                    parameter_spec=ParameterSpec(params={}),
                ),
            )
            for i in range(2)
        ],
    )
    cropped_image_req_data = AutomationRequest(
        process_guid="test-guid",
        correlation="test-work",
        results_subject=None,
        job_id=None,
        auth_token=test_profile.auth_token,
        path="/test/path",
        data=CropImageRequest(
            src_asset_id="asset_id",
            src_version=[1, 1, 1],
            image_file=FileParameter(file_id="file_id"),
            crop_pos_x=None,
            crop_pos_y=None,
            crop_w=IntParameterSpec(default=320, label="crop_w"),
            crop_h=IntParameterSpec(default=180, label="crop_h"),
        ).model_dump(),
        telemetry_context={},
        event_id="1",
    )
    cropped_image_response = CropImageResponse(
        src_asset_id="asset_id",
        src_file_id="file_id",
        file_path="test/path",
        src_version="1.1.1",
    )

    event_id = generate_events(
        api_base, client, test_profile.profile, generate_event_count
    )[0]
    # Update event that does not exist
    r = client.post(
        f"{api_base}/events/processed/{event_seq_to_id(99999)}",
        json=data.model_dump(),
        headers=auth_header,
    )
    assert_status_code(r, HTTPStatus.NOT_FOUND)

    # Test update event not owner
    r = client.post(
        f"{api_base}/events/processed/{event_id}",
        json=data.model_dump(),
        headers=second_auth_header,
    )
    assert_status_code(r, HTTPStatus.FORBIDDEN)

    # Update event
    r = client.post(
        f"{api_base}/events/processed/{event_id}",
        json=data.model_dump(),
        headers=auth_header,
    )
    assert_status_code(r, HTTPStatus.OK)
    event_res: EventUpdateResponse = munchify(r.json())
    assert event_res.job_result_data.processed is True
    assert event_res.job_result_data.request_result[0].processed is True

    # test one item is not processed
    new_event_id = generate_events(
        api_base, client, test_profile.profile, generate_event_count
    )[0]

    data.processed = True
    data.request_result[0].processed = False
    r = client.post(
        f"{api_base}/events/processed/{new_event_id}",
        json=data.model_dump(),
        headers=auth_header,
    )
    assert_status_code(r, HTTPStatus.OK)
    event_res: EventUpdateResponse = munchify(r.json())
    assert event_res.job_result_data.processed is False
    assert event_res.job_result_data.request_result[0].processed is False

    # Test update existed event within new processed JobDefinition item
    data.request_result[0].processed = True
    r = client.post(
        f"{api_base}/events/processed/{new_event_id}",
        json=data.model_dump(),
        headers=auth_header,
    )
    assert_status_code(r, HTTPStatus.OK)
    event_res: EventUpdateResponse = munchify(r.json())
    assert event_res.job_result_data.processed is True
    assert event_res.job_result_data.request_result[0].processed is True

    # test update existed event within new not processed CropImageResponse items
    data.request_result[0].processed = False
    data.request_result[1].processed = False
    data.request_result[0].request = cropped_image_req_data
    data.request_result[0].result = cropped_image_response
    second_image_response = cropped_image_response.model_copy()
    second_image_req_data = cropped_image_req_data.model_copy()
    second_image_req_data.data["image_file"] = "file_id_2"
    data.request_result[1].request = second_image_req_data
    data.request_result[1].result = second_image_response
    r = client.post(
        f"{api_base}/events/processed/{event_id}",
        json=data.model_dump(),
        headers=auth_header,
    )
    assert_status_code(r, HTTPStatus.OK)
    event_res: EventUpdateResponse = munchify(r.json())
    assert event_res.job_result_data.processed is True
    assert len(event_res.job_result_data.request_result) == 4
