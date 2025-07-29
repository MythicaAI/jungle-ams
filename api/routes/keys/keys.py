"""API routing layer and logic for key management"""

import secrets
import string
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import col, delete as sql_delete, insert, select
from sqlmodel.ext.asyncio.session import AsyncSession

from db.connection import TZ, get_db_session
from db.schema.profiles import Profile, ProfileKey
from routes.authorization import session_profile

router = APIRouter(prefix="/keys", tags=["keys"])

KEY_PREFIX = "key_"


class KeyGenerateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    expires: Optional[datetime] = None


class KeyGenerateResponse(BaseModel):
    name: str
    value: str
    description: Optional[str] = None
    created: datetime
    expires: datetime
    is_expired: bool = False


def is_expired(expires_db: datetime, now_utc: datetime) -> bool:
    """Returns true if the database timestamp is expired (will be converted from database TZ to UTC)"""
    return expires_db.astimezone(TZ).astimezone(timezone.utc) < now_utc


def is_naive(dt):
    """Test if datetime is naive or aware"""
    return dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None


@router.post("/", status_code=HTTPStatus.CREATED)
async def generate(
        create: KeyGenerateRequest,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)
) -> KeyGenerateResponse:
    """Generate a new API Key"""
    # timezone work done inside of session to ensure it is derived from the database connection
    if create.expires is None:
        create.expires = datetime.now(TZ) + timedelta(days=365)

    if is_naive(create.expires):
        raise HTTPException(HTTPStatus.BAD_REQUEST, "expiration time must include timezone information")

    if create.expires < datetime.now(TZ) + timedelta(minutes=5):
        raise HTTPException(HTTPStatus.BAD_REQUEST, "expiration date cannot be less than 5 minutes")

    key = KEY_PREFIX + "".join(secrets.choice(string.ascii_letters) for _ in range(20))

    # ensure that we are storing timezones in the database with the native timezone format
    expires = create.expires.astimezone(TZ)
    await db_session.exec(insert(ProfileKey).values(
        key=key,
        owner_seq=profile.profile_seq,
        expires=expires,
        payload={
            "name": create.name,
            "description": create.description,
        }
    ))
    await db_session.commit()

    # re-read the key to ensure consistency
    result = (await db_session.exec(select(ProfileKey).where(ProfileKey.key == key))).one_or_none()
    if result is None:
        raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                            detail="failed to generate API key")
    # ensure timezone aware and shifted to UTC
    return KeyGenerateResponse(
        name=create.name,
        value=key,
        created=result.created.replace(tzinfo=TZ).astimezone(timezone.utc),
        expires=result.expires.replace(tzinfo=TZ).astimezone(timezone.utc),
        is_expired=False,
        description=result.payload["description"])


@router.delete("/{key}")
async def delete(
        key: str,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)):
    """Delete an existing API key"""
    stmt = sql_delete(ProfileKey).where(ProfileKey.key == key).where(ProfileKey.owner_seq == profile.profile_seq)
    await db_session.exec(stmt)
    await db_session.commit()


@router.get("/")
async def current(
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> list[KeyGenerateResponse]:
    """Get all API keys for this profile"""
    # pylint: disable=no-member
    stmt = select(ProfileKey).where(ProfileKey.owner_seq == profile.profile_seq).where(
        col(ProfileKey.key).startswith(KEY_PREFIX))
    rows = (await db_session.exec(stmt)).all()

    # Ensure using normalized db timezone and in UTC at the API level
    now_utc = datetime.now(timezone.utc)
    response = [KeyGenerateResponse(
        created=r.created.astimezone(TZ).astimezone(timezone.utc),
        expires=r.expires.astimezone(TZ).astimezone(timezone.utc),
        is_expired=is_expired(r.expires, now_utc),
        value=r.key,
        name=r.payload["name"],
        description=r.payload["description"]) for r in rows]
    return response
