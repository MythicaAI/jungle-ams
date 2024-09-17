"""Topology tests"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

from munch import munchify

from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code


def test_create_update(client, api_base, create_profile):
    test_profile = create_profile()
    test_profile2 = create_profile()
    headers = test_profile.authorization_header()
    headers2 = test_profile2.authorization_header()

    # Create a job definition
    r = client.post(f'{api_base}/jobs/definitions',
                    json={
                        'job_type': 'houdini_generate_mesh',
                        'name': 'Generate Cactus',
                        'description': 'Generates a cactus mesh',
                        'config': {
                            'hda_file': 'file_qfJSVuWRJvogEDYezoZn8cwdP8D',
                            'hda_definition_index': 0
                        },
                        'input_files': 2,
                        'params_schema': {
                            'size': {
                                'type': 'Float',
                                'label': 'Segment Size',
                                'min': 0.0,
                                'max': 10.0
                            }
                        }
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    job_def_id = o.job_def_id

    # Get job definitions
    r = client.get(f'{api_base}/jobs/definitions', headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    definitions = r.json()
    assert any([definition['job_def_id'] == job_def_id for definition in definitions])

    # Create an invalid job
    r = client.post(f'{api_base}/jobs',
                    json={
                        'job_def_id': "INVALID",
                        'input_files': [],
                    'params': {
                            'size': 5.0
                        }
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # Create a job
    r = client.post(f'{api_base}/jobs',
                    json={
                        'job_def_id': job_def_id,
                        'input_files': [
                            'file_qfJSVuWRJvogEDYezoZn8cwdP8D',
                            'file_qfJSVuWRJvogEDYezoZn8cwdP8D'
                        ],
                        'params': {
                            'size': 5.0
                        }
                    },
                    headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert 'job_def_id' in o
    assert 'job_id' in o
    job_id = o.job_id

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
