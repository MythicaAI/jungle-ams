import hashlib
import logging
import os
from datetime import timezone
from http import HTTPStatus

from flask import Blueprint, request, jsonify
from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError, BaseModel, HttpUrl

from auth.generate_token import generate_token
from config import app_config
from db.schema.profiles import *
from db.connection import get_session
from routes.responses import ListResponse, ScalarResponse
from sqlmodel import select, update, delete

from db.validate_as_json import validate_as_json

router = APIRouter(prefix="/profiles", tags=["profiles"])

log = logging.getLogger(__name__)


# Define a dictionary with the attributes you want to validate
class CreateUpdateProfileModel(BaseModel):
    """A model with only allowed public properties for profile creation"""
    name: str = None
    description: str | None = None
    signature: str | None = None
    tags: dict | None = None
    profile_base_href: str | None = None


class ProfileResponse(BaseModel):
    """A model with only allowed public properties for profile creation"""
    id: UUID = None
    name: str | None = None
    description: str | None = None
    email: str | None = None
    signature: str | None = None
    tags: dict | None = Field(default={})
    profile_base_href: str | None = None
    active: bool = None
    created: datetime = None
    updated: datetime | None = None
    email_verified: bool = None


class SessionStartResponse(BaseModel):
    token: str
    profile: ProfileResponse
    sessions: list[ProfileSession]


class ValidateEmailResponse(BaseModel):
    profile_id: UUID

@router.get('/')
async def get_profiles() -> list[ProfileResponse]:
    with get_session() as session:
        return [ProfileResponse(**profile.model_dump())
                for profile in session.exec(select(Profile))]


@router.get('/{profile_id}')
async def get_profile(profile_id: str) -> ProfileResponse:
    UUID(hex=profile_id, version=4)  # validate the ID
    with get_session() as session:
        profile = session.exec(select(Profile).where(Profile.id == profile_id)).first()
        return ProfileResponse(**profile.model_dump())


@router.get('/start_session/{profile_id}')
async def start_session(profile_id: UUID) -> SessionStartResponse:
    with get_session() as session:
        session.begin()
        result = session.exec(update(Profile).values(
            {'login_count': Profile.login_count + 1, 'active': True}).where(
            Profile.id == profile_id))
        session.commit()

        if result.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail='profile not found')

        session.exec(delete(ProfileSession).where(ProfileSession.profile_id == profile_id))
        session.commit()

        # Generate a new token
        profile = session.exec(select(Profile).where(Profile.id == profile_id)).first()
        profile_data = profile.model_dump()
        token = generate_token(profile)

        # Add a new session
        location = app_config().mythica_location
        profile_session = ProfileSession(profile_id=profile_id,
                                         refreshed=datetime.now(timezone.utc),
                                         location=location,
                                         authenticated=False,
                                         auth_token=token)
        session.add(profile_session)
        session.commit()

        sessions = session.exec(select(ProfileSession).where(ProfileSession.profile_id == profile_id)).all()
        sessions = [ProfileSession(**s.model_dump()) for s in sessions]

        profile_summary = ProfileResponse(**profile_data)

        result = SessionStartResponse(
            token=token,
            profile=profile_summary,
            sessions=sessions)
        return result


@router.get('/validate_email/{profile_id}')
async def validate_email(profile_id: UUID) -> ValidateEmailResponse:
    with get_session() as session:
        stmt = update(Profile).values({Profile.email_verified: True}).where(
            Profile.id == profile_id)
        stmt_sql = str(stmt)
        log.info(stmt_sql)
        result = session.exec(stmt)
        if result.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail='profile not found')
        session.commit()
        return ValidateEmailResponse(profile_id=profile_id)


@router.post('/create')
async def create_profile(req_profile: CreateUpdateProfileModel) -> ProfileResponse:
    session = get_session()
    try:
        profile = Profile(**req_profile.dict())
    except TypeError as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=str(e))
    except ValidationError as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=str(e))

    session.add(profile)
    session.commit()
    session.refresh(profile)

    return ProfileResponse(**profile.model_dump())


@router.post('/update/{profile_id}')
async def update_profile(profile_id: UUID, req_profile: CreateUpdateProfileModel) -> ProfileResponse:
    """
    TODO: authentication
    """
    session = get_session(echo=True)
    stmt = update(Profile).where(Profile.id == profile_id).values(**req_profile.model_dump())
    result = session.execute(stmt)
    rows_affected = result.rowcount
    if rows_affected == 0:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail='missing profile')
    session.commit()

    updated = session.exec(select(Profile).where(Profile.id == profile_id)).one()
    return ProfileResponse(**updated.model_dump())
