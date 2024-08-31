"""Topology tests"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

from munch import munchify

from tests.fixtures.create_profile import create_profile
from tests.shared_test import get_random_string, assert_status_code


def test_create_update(client, api_base, create_profile):
    test_profile = create_profile()
    headers = test_profile.authorization_header()

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
    job_id = o.job_id

    # Complete the job
    r = client.post(f'{api_base}/jobs/results/{job_id}',
                json={
                    'created_in': 'houdini-worker',
                    'result_data': {
                        'file': 'file_qfJSVuWRJvogEDYezoZn8cwdP8D'
                    }
                },
                headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())

    # Get the result data
    r = client.get(f'{api_base}/jobs/results/{job_id}', headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    results = r.json()
    assert len(results) == 1
    for result in results:
        o = munchify(result)
        assert o.job_id == job_id
        assert o.created_in == 'houdini-worker'
        assert o.result_data.file == 'file_qfJSVuWRJvogEDYezoZn8cwdP8D'
