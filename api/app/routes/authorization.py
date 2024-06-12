from typing import Annotated

from fastapi import Header
from auth.data import get_profile
from db.schema.profiles import Profile


async def current_profile(authorization: Annotated[str | None, Header()]) -> Profile:
    return get_profile(authorization)
