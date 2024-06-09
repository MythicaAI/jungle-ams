from http import HTTPStatus


from munch import munchify
from fastapi.testclient import TestClient
from pydantic import BaseModel
from db.schema.profiles import Profile, ProfileSession

from .shared_test import api_base

class ProfileTestInfo(BaseModel):
    auth_token: str
    profile: Profile
    profile_session: ProfileSession

    def authorization_header(self):
        return {"Authorization": f"Bearer {self.auth_token}"}


def create_and_auth(client: TestClient) -> ProfileTestInfo:
    r = client.post(f"{api_base}/profiles",
                    json={'name': 'test-profile'})
    assert r.status_code == HTTPStatus.CREATED
    o = munchify(r.json())
    assert o.name == "test-profile"
    profile_id = o.id

    # Start session
    o = munchify(client.get(f"{api_base}/profiles/start_session/{profile_id}").json())
    assert o.profile.id == profile_id
    assert len(o.sessions) > 0
    assert len(o.token) > 0

    return ProfileTestInfo(auth_token=o.token, profile=o.profile, profile_session=o.sessions[0])