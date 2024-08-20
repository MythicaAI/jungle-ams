import secrets
import string
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import col, delete, insert, select

from db.connection import get_session
from db.schema.profiles import Profile, ProfileKey
from routes.authorization import current_profile

router = APIRouter(prefix='/keys', tags=['keys'])

KEY_PREFIX = 'key_'


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


@router.post('/', status_code=HTTPStatus.CREATED)
async def generate_key(
        create: KeyGenerateRequest,
        profile: Profile = Depends(current_profile)
) -> KeyGenerateResponse:
    """Generate a new API Key"""
    if create.expires is None:
        create.expires = datetime.now(timezone.utc) + timedelta(days=365)

    # Function to check if datetime is naive or aware
    def is_naive(dt):
        return dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None

    if is_naive(create.expires):
        raise HTTPException(HTTPStatus.BAD_REQUEST, 'expiration time must include timezone information')
    if create.expires < datetime.now(timezone.utc) + timedelta(minutes=10):
        raise HTTPException(HTTPStatus.BAD_REQUEST, 'expiration date cannot be less than 10 minutes')

    with get_session() as session:
        key = KEY_PREFIX + ''.join(secrets.choice(string.ascii_letters) for _ in range(20))
        expires = create.expires.astimezone(timezone.utc)
        session.exec(insert(ProfileKey).values(
            key=key,
            owner_seq=profile.profile_seq,
            expires=expires,
            payload={
                'name': create.name,
                'description': create.description,
            }
        ))
        session.commit()
        result = session.exec(select(ProfileKey).where(ProfileKey.key == key)).one_or_none()
        if result is None:
            raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR,
                                detail="failed to generate API key")
        return KeyGenerateResponse(
            name=create.name,
            value=key,
            created=result.created.astimezone(timezone.utc),  # ensure timezone aware
            expires=result.expires,
            description=result.payload['description'])


@router.delete('/{key}')
async def delete_key(key: str, profile: Profile = Depends(current_profile)):
    """Delete an existing API key"""
    with get_session() as session:
        stmt = delete(ProfileKey).where(ProfileKey.key == key).where(ProfileKey.owner_seq == profile.profile_seq)
        session.execute(stmt)
        session.commit()


@router.get('/')
async def get_keys(profile: Profile = Depends(current_profile)) -> list[KeyGenerateResponse]:
    """Get all API keys for this profile"""
    with get_session() as session:
        # pylint: disable=no-member
        stmt = select(ProfileKey).where(ProfileKey.owner_seq == profile.profile_seq).where(
            col(ProfileKey.key).startswith(KEY_PREFIX))
        rows = session.exec(stmt).all()
        response = [KeyGenerateResponse(
            created=r.created.astimezone(timezone.utc),  # ensure timezone aware
            expires=r.expires,
            value=r.key,
            name=r.payload['name'],
            description=r.payload['description']) for r in rows]
        return response
