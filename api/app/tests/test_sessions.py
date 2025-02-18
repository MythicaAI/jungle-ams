"""
Test the session creation from different contexts including negative cases
"""

# pylint: disable=redefined-outer-name, unused-import

from http import HTTPStatus

import pytest
from munch import munchify

from main import app
from profiles.auth0_validator import Auth0ValidatorFake
from routes.sessions.sessions import get_auth_validator
from tests.conftest import api_base
from tests.fixtures.create_profile import create_profile
from tests.shared_test import ProfileTestObj, assert_status_code


@pytest.mark.asyncio
async def test_start_session_api_key(api_base, client, create_profile):
    test_profile: ProfileTestObj = await create_profile()
    auth_headers = test_profile.authorization_header()
    req = {
        'name': 'test-dev-key'
    }
    r = client.post(f'{api_base}/keys', json=req, headers=auth_headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    assert 'value' in o
    api_key = o.value

    r = client.get(f'{api_base}/sessions/key/{api_key}')
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert 'token' in o
    assert 'profile' in o
    assert o.profile.profile_id == test_profile.profile.profile_id


def test_start_session_openid(api_base, client):
    async def get_fake_auth_validator() -> Auth0ValidatorFake:
        return Auth0ValidatorFake()

    app.dependency_overrides[get_auth_validator] = get_fake_auth_validator

    test_data = {
        'access_token': "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZvRkFTbk9wWDZjY3J1TUtRd0pEQSJ9.eyJpc3MiOiJodHRwczovL2Rldi1kdHZxajBpdWM1cm5iNngyLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwMTEwODA0MDY1OTk0NjIwNTgzNyIsImF1ZCI6WyJodHRwOi8vbG9jYWxob3N0OjU1NTUvdjEiLCJodHRwczovL2Rldi1kdHZxajBpdWM1cm5iNngyLnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3MjQ4MTY2MzMsImV4cCI6MTcyNDkwMzAzMywic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImF6cCI6IjRDWmhRV29ObTFXSDhsODA0MkxlRjM4cUhyVVRSMmF4In0.hEisquIMeyE560laKqSj0WdWcAkZBN0y3kobtyb4lkDlyz2we7pXkhkgNnZk_TKvlm3reC4yH_CLN_Kw_QDKkPHOJXtANE_ELmqhKintoWQ9wNROdqJJ1mGSVO-YUQXWyBmMUdHeCcwbfb1D0u6m2J1t8HVEW2RVNuy16Nk7ocbMwri5jGVYd2DUT-_zO9qcgEHnjCEOY-Q1HjMshin3tgh-H2voIAyOz3ydNghtdT4svoYJzPk6NpIMiGo6_J5H2uUlDo0wSjr2-71LV7aV9lw6bFg2F28LgpGt7HnUKEE2C0HxDDKo2y4i1LhN7alTmAGOHDX-2vEHZWjNBb9LVQ",
        'user_id': 'googleoath|12345678'
    }
    r = client.post(f'{api_base}/sessions/auth0-spa', json=test_data)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert 'token' in o
    assert len(o.token) > 8
    assert o.roles == []


def test_resume_session_openid():
    """Resume the session again using the openID subject"""


def test_merged_open_ids():
    """Given two different open IDs they should both locate the same profile if the
    email address in the given open ID is verified and refers to the same profile"""
