from http import HTTPStatus
from http.client import HTTPException
from typing import Annotated

from fastapi import Header
from auth.data import get_profile
from db.schema.profiles import Profile
import auth.roles as roles


async def current_profile(authorization: Annotated[str | None, Header()]) -> Profile:
    return get_profile(authorization)
