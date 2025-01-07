"""Test suite for the job system: job definitions and jobs"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

from cryptid.cryptid import event_id_to_seq, job_id_to_seq
from db.connection import get_session
from db.schema.events import Event
from db.schema.jobs import Job
from fastapi.testclient import TestClient
from munch import munchify
from sqlmodel import select
from tests.fixtures.create_profile import create_profile
from tests.fixtures.create_asset import create_asset
from tests.shared_test import ProfileTestObj, assert_status_code


def test_create_update(client, api_base, create_profile, create_asset, uploader):
    test_profile: ProfileTestObj = create_profile()
    test_profile2 = create_profile()
    headers = test_profile.authorization_header()
    headers2 = test_profile2.authorization_header()
    hda_file_id = None

    # create an asset (it should already have an HDA and use that as the fictional src_file_id)
    asset = create_asset(test_profile, uploader)
    for file_obj in asset.contents['files']:
       if file_obj.name.endswith('hda') :
           hda_file_id = file_obj.file_id
    assert hda_file_id is not None

    # Create a job definition
    r = client.post(f'{api_base}/jobs/definitions',
                    json={
                        'job_type': 'houdini::/mythica/generate_mesh',
                        'name': 'Generate Cactus',
                        'description': 'Generates a cactus mesh',
                        'params_schema': {
                            'params': {
                                'hda_file': {
                                    'param_type': 'file',
                                    'label': 'HDA File',
                                    'default': 'file_qfJSVuWRJvogEDYezoZn8cwdP8D',
                                    'constant': True
                                },
                                'hda_definition_index': {
                                    'param_type': 'int',
                                    'label': 'HDA Definition Index',
                                    'default': 0,
                                    'constant': True
                                },
                                'size': {
                                    'param_type': 'float',
                                    'label': 'Segment Size',
                                    'default': 0.0,
                                    'min': 0.0,
                                    'max': 10.0
                                }
                            }
                        },
                        'src_file_id': hda_file_id
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    job_def_id = o.job_def_id

    # Get job definition from list
    r = client.get(f'{api_base}/jobs/definitions', headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    definitions = r.json()
    assert any([definition['job_def_id'] == job_def_id for definition in definitions])

    # Get job definition directly
    r = client.get(f'{api_base}/jobs/definitions/{job_def_id}', headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    definition = r.json()
    assert definition['job_def_id'] == job_def_id
    assert definition['owner_id'] == test_profile.profile.profile_id

    # Get job definition by asset
    r = client.get(f'{api_base}/jobs/definitions/by_asset/{asset.asset_id}', headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert(len(r.json()) == 1)
    job_def = munchify(r.json()[0])
    assert job_def.src_file_id == hda_file_id

    # Get job definition by asset version
    major, minor, patch = asset.version.split('.')
    r = client.get(
        f'{api_base}/jobs/definitions/by_asset/{asset.asset_id}/versions/{major}/{minor}/{patch}',
        headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert(len(r.json()) == 1)
    job_def = munchify(r.json()[0])
    assert job_def.src_file_id == hda_file_id

    # Get invalid job definitions
    r = client.get(f'{api_base}/jobs/definitions/jobdef_3ZUcvpXisvZeAjWWyHzFpuJdSSKr', headers=headers)
    assert_status_code(r, HTTPStatus.NOT_FOUND)

    # Create an invalid job
    r = client.post(f'{api_base}/jobs',
                    json={
                        'job_def_id': "INVALID",
                        'params': {
                            'size': 5.0
                        }
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # Create a bad parameter job
    r = client.post(f'{api_base}/jobs',
                    json={
                        'job_def_id': job_def_id,
                        'params': {}
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # Create a job
    r = client.post(f'{api_base}/jobs',
                    json={
                        'job_def_id': job_def_id,
                        'params': {
                            'size': 5.0
                        }
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert 'job_def_id' in o
    assert 'job_id' in o
    assert 'event_id' in o
    job_def_id = o.job_def_id
    job_id = o.job_id

    # find the event generated by the job creation
    with get_session() as session:
        event_seq = event_id_to_seq(o.event_id)
        event = session.exec(select(Event).where(Event.event_seq == event_seq)).one_or_none()
        assert event is not None
        assert "requested" in event.event_type
        job_data = munchify(event.job_data)
        assert "profile_id" in job_data
        assert "job_id" in job_data
        assert "job_def_id" in job_data
        assert "params" in job_data
        assert "job_results_endpoint" in job_data
        assert job_data.job_results_endpoint
        assert job_data.job_id == job_id
        assert job_data.job_def_id == job_def_id

    # Do some work
    r = client.post(f'{api_base}/jobs/results/{job_id}',
                    json={
                        'created_in': 'houdini-worker',
                        'result_data': {
                            'progress': 42,
                        }
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert 'job_result_id' in o

    # Do more work
    r = client.post(f'{api_base}/jobs/results/{job_id}',
                    json={
                        'created_in': 'houdini-worker',
                        'result_data': {
                            'file': 'file_qfJSVuWRJvogEDYezoZn8cwdP8D'
                        }
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)

    # Mark the job as completed
    r = client.post(f'{api_base}/jobs/complete/{job_id}')
    assert_status_code(r, HTTPStatus.OK)

    # Get the result data
    r = client.get(f'{api_base}/jobs/results/{job_id}', headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    results = r.json()
    assert results['completed']
    assert len(results) == 2
    for result in results['results']:
        o = munchify(result)
        assert o.created_in == 'houdini-worker'
        assert 'result_data' in o
        if 'file' in o.result_data:
            assert o.result_data.file == 'file_qfJSVuWRJvogEDYezoZn8cwdP8D'
        elif 'progress' in o.result_data:
            assert o.result_data.progress == 42
        else:
            assert False, "missing result data"

    # Get the result data from another profile
    r = client.get(f'{api_base}/jobs/results/{job_id}', headers=headers2)
    assert_status_code(r, HTTPStatus.FORBIDDEN)



def test_delete_canary(client: TestClient, api_base, create_profile):
    test_profile: ProfileTestObj = create_profile()
    headers = test_profile.authorization_header()
    test_profile2: ProfileTestObj = create_profile(email="test2.test@email.com")
    headers2 = test_profile2.authorization_header()
    privileged_profile: ProfileTestObj = create_profile(email="test@mythica.ai", validate_email=True)
    privileged_headers = privileged_profile.authorization_header()


    def crete_job_def(headers):
        # Create a job definition
        r = client.post(f'{api_base}/jobs/definitions',
                        json={
                            'job_type': 'houdini::/mythica/generate_mesh',
                            'name': 'Generate test_scale_input',
                            'description': 'test_scale_input',
                            'params_schema': {
                                'params': {
                                    'hda_file': {
                                        'param_type': 'file',
                                        'label': 'HDA File',
                                        'default': 'file_qfJSVuWRJvogEDYezoZn8cwdP8D',
                                        'constant': True
                                    },
                                    'hda_definition_index': {
                                        'param_type': 'int',
                                        'label': 'HDA Definition Index',
                                        'default': 0,
                                        'constant': True
                                    },
                                    'size': {
                                        'param_type': 'float',
                                        'label': 'Segment Size',
                                        'default': 0.0,
                                        'min': 0.0,
                                        'max': 10.0
                                    }
                                }
                            }
                        },
                        headers=headers)
        return r

    r = crete_job_def(headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    job_def_id = o.job_def_id

    # Get job definition from list
    r = client.get(f'{api_base}/jobs/definitions', headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    definitions = r.json()
    assert any([definition['job_def_id'] == job_def_id for definition in definitions])

    # Create a job
    r = client.post(f'{api_base}/jobs',
                    json={
                        'job_def_id': job_def_id,
                        'params': {
                            'size': 5.0
                        }
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert 'job_def_id' in o
    assert 'job_id' in o
    assert 'event_id' in o
    job_def_id = o.job_def_id
    job_seq = job_id_to_seq(o.job_id)

    # find the job
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_seq == job_seq)).one_or_none()
        assert job is not None
        assert job.job_def_seq is not None

    r = client.delete(f'{api_base}/jobs/definitions/delete_canary_jobs_def', headers=headers2)
    o = munchify(r.json())
    assert_status_code(r, HTTPStatus.UNAUTHORIZED)

    # Test unauthorized delete jobs
    r = client.delete(f'{api_base}/jobs/definitions/delete_canary_jobs_def', headers=headers)
    o = munchify(r.json())
    assert_status_code(r, HTTPStatus.OK)

    # find the job and check job_def_seq is set to null
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_seq == job_seq)).one_or_none()
        assert job is not None
        assert job.job_def_seq is None

    r = client.get(f'{api_base}/jobs/definitions', headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    definitions = r.json()
    assert all([definition['job_def_id'] != job_def_id for definition in definitions])

    # Test delete job_def by an admin
    r = crete_job_def(headers)
    assert_status_code(r, HTTPStatus.CREATED)
    r = client.delete(f'{api_base}/jobs/definitions/delete_canary_jobs_def', headers=privileged_headers)
    o = munchify(r.json())
    assert_status_code(r, HTTPStatus.OK)
    r = client.get(f'{api_base}/jobs/definitions', headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    definitions = r.json()
    assert all([definition['job_def_id'] != job_def_id for definition in definitions])
