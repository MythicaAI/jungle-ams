import hashlib
import logging
import os
from datetime import timezone
from http import HTTPStatus

from flask import Blueprint, request, jsonify
from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError, BaseModel, HttpUrl

from auth.generate_token import generate_token
from db.schema.profiles import *
from db.connection import get_session
from routes.responses import ListResponse, ScalarResponse
from sqlmodel import select, update, delete

from db.validate_as_json import validate_as_json

router = APIRouter(prefix="/profiles")

log = logging.getLogger(__name__)


# Define a dictionary with the attributes you want to validate
class CreateUpdateProfileModel(BaseModel):
    """A model with only allowed public properties for profile creation"""
    name: str = None
    description: str | None = None
    signature: str | None = None
    tags: dict | None = None
    profile_base_href: str | None = None


class ProfileResponseModel(BaseModel):
    """A model with only allowed public properties for profile creation"""
    id: UUID = None
    name: str | None = None
    description: str | None = None
    signature: str | None = None
    tags: dict | None
    profile_base_href: str | None = None
    active: bool = None
    created: datetime = None
    updated: datetime | None = None
    email_verified: bool = None


class ProfileScalarResponse(ScalarResponse):
    result: ProfileResponseModel

class ProfileListResponse(ListResponse):
    results: list[ProfileResponseModel]

@router.get('/')
async def get_profiles() -> ProfileListResponse:
    with get_session() as session:
        return ProfileListResponse(
            results=[ProfileResponseModel(**profile.model_dump()) for profile in session.exec(select(Profile))])


@router.get('/{profile_id}')
async def get_profile(profile_id: str) -> ProfileScalarResponse:
    UUID(hex=profile_id, version=4)  # validate the ID
    with get_session() as session:
        return ProfileScalarResponse(result=session.exec(select(Profile).where(Profile.id == profile_id)))


class SessionStartResponse(ScalarResponse):
    result: ProfileResponseModel
    sessions: list[ProfileSession]
    token: str

@router.get('/start_session/{profile_id}')
async def start_session(profile_id: str):
    UUID(hex=profile_id, version=4)  # validate the ID
    with get_session() as session:
        session.begin()
        result = session.exec(update(Profile).values(
            {'login_count': Profile.login_count + 1, 'active': True}).where(
            Profile.id == profile_id))
        session.commit()

        if result.rowcount == 0:
            return jsonify({'error': 'profile not found'}), HTTPStatus.NOT_FOUND

        session.exec(delete(ProfileSession).where(ProfileSession.profile_id == profile_id))
        session.commit()

        # Add a new session
        location = os.environ.get('MYTHICA_LOCATION', 'localhost')
        profile_session = ProfileSession(profile_id=profile_id,
                                         refreshed=datetime.now(timezone.utc),
                                         location=location,
                                         authenticated=False,
                                         auth_token='')
        session.add(profile_session)
        session.commit()

        profile_sessions = session.exec(select(ProfileSession).where(ProfileSession.profile_id == profile_id)).all()
        profile = session.exec(select(Profile).where(Profile.id == profile_id)).first()

        token = generate_token(profile)

        return jsonify({'message': 'ok',
                        'profile': profile.model_dump(),
                        'token': token,
                        'sessions': [s.model_dump() for s in profile_sessions]}), HTTPStatus.OK


@router.get('/validate_email/{profile_id}')
async def validate_email(profile_id: str):
    UUID(hex=profile_id, version=4)  # validate the ID
    with get_session() as session:
        stmt = update(Profile).values({Profile.email_verified: True}).where(Profile.id == profile_id)
        stmt_sql = str(stmt)
        log.info(stmt_sql)
        result = session.exec(stmt)
        if result.rowcount == 0:
            return jsonify({'error': 'profile not found'}), HTTPStatus.NOT_FOUND
        session.commit()
        return jsonify({'message': 'ok'}), HTTPStatus.OK


@router.post('/create')
async def create_profile():
    session = get_session()
    try:
        obj = dict(**request.json)
        req_model = CreateUpdateProfileModel.model_validate(obj=obj)
        profile = Profile(**req_model.dict())
    except TypeError as e:
        return jsonify({'error': str(e)}), HTTPStatus.BAD_REQUEST
    except ValidationError as e:
        return e.json(), HTTPStatus.BAD_REQUEST

    session.add(profile)
    session.commit()
    session.refresh(profile)

    return jsonify({'message': 'ok', 'profile': profile.model_dump()})


@router.post('/update/{profile_id}')
async def update_profile(profile_id: str):
    """
    TODO: authentication
    """
    UUID(hex=profile_id, version=4)
    filtered_update = {'updated': None}
    try:
        obj = dict(**request.json)

        update_req = CreateUpdateProfileModel.model_validate(obj=obj)
        for k, v in update_req.model_dump().items():
            if v is not None:
                filtered_update[k] = v
    except TypeError as e:
        return jsonify({'error': str(e)}), HTTPStatus.BAD_REQUEST
    except ValidationError as e:
        return e.json(), HTTPStatus.BAD_REQUEST
    session = get_session(echo=True)
    stmt = update(Profile).where(Profile.id == profile_id).values(**filtered_update)
    result = session.execute(stmt)
    rows_affected = result.rowcount
    if rows_affected == 0:
        return jsonify({'error': 'missing profile'})

    updated = session.exec(select(Profile).where(Profile.id == profile_id)).one()
    return jsonify({'message': 'ok', 'profile': ProfileListModel(**updated.model_dump()).model_dump()}), HTTPStatus.OK
