import logging

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select, insert
from pydantic import BaseModel
from typing import Any

from auth.api_id import event_seq_to_id, event_id_to_seq, file_seq_to_id, profile_seq_to_id
from config import app_config
from enum import Enum
from http import HTTPStatus
from db.connection import get_session
from db.schema.events import Event
from db.schema.media import FileContent
from db.schema.profiles import Profile
from routes.authorization import current_profile

log = logging.getLogger(__name__)

class GenerateMeshRequest(BaseModel):
    file_id: str
    params: dict[str, Any]
    material_params: dict[str, Any] | None = None

class GenerateMeshInterfaceResponse(BaseModel):
    file_id: str

class GenerateMeshResponse(BaseModel):
    event_id: str

class GenerateMeshState(str, Enum):
    """Generate mesh request states"""
    queued = "queued"
    processing = "processing"
    failed = "failed"
    completed = "completed"

class GenerateMeshStatusResponse(BaseModel):
    state: GenerateMeshState = GenerateMeshState.queued
    file_id: str | None = None

router = APIRouter(prefix="/jobs", tags=["jobs"])

def add_generate_mesh_event(session: Session, request: GenerateMeshRequest, profile_seq: int):
    """Add a new event that triggers mesh generation"""
    # Create a new pipeline event
    job_data = {
        'file_id': request.file_id,
        'profile_id': profile_seq_to_id(profile_seq),
        'params': request.params,
        'material_params': request.material_params
    }
    location = app_config().mythica_location
    stmt = insert(Event).values(
        event_type="generate_mesh_requested",
        job_data=job_data,
        owner_seq=profile_seq,
        created_in=location,
        affinity=location)
    event_result = session.exec(stmt)
    log.info("generate mesh event for %s by %s -> %s",
             request.file_id, profile_seq, event_result)
    return event_result

@router.get("/generate-mesh/interface/{file_id}")
async def get_generate_mesh_interface_by_id(
    file_id: str) -> GenerateMeshInterfaceResponse:
    """Gets the interface definition for a file"""

    with get_session() as session:
        # HACK: Add method of associating interface json with a file
        query = (
            select(FileContent)
            .where(FileContent.name.like(f"{file_id}_interface.json")) # pylint: disable=E1101
            .limit(1)
        )

        file = session.exec(query).one_or_none()
        if file is not None:
            return GenerateMeshInterfaceResponse(file_id=file_seq_to_id(file.file_seq))

    return GenerateMeshInterfaceResponse(file_id="")

@router.post("/generate-mesh")
async def generate_mesh_file_by_id(
    request: GenerateMeshRequest,
    profile: Profile = Depends(current_profile)) -> GenerateMeshResponse:
    """Generates a mesh based on the file content"""

    with get_session() as session:
        event_result = add_generate_mesh_event(session, request, profile.profile_seq)
        session.commit()

        event_seq = event_result.inserted_primary_key[0]
        event_id = event_seq_to_id(event_seq)

        return GenerateMeshResponse(event_id=event_id)

@router.get("/generate-mesh/status/{event_id}")
async def get_generate_mesh_status_by_id(
    event_id: str) -> GenerateMeshStatusResponse:
    """Gets the results of a generate mesh request"""

    with get_session() as session:
        event_seq = event_id_to_seq(event_id)
        event = session.exec(select(Event).where(Event.event_seq == event_seq)).one_or_none()
        if event is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="event_id not found")

        state = GenerateMeshState.queued
        file_id = None

        if not event.acked:
            state = GenerateMeshState.queued
        elif not event.completed:
            state = GenerateMeshState.processing
        else:
            # HACK: Add method of associating resulting mesh with event
            query = (
                select(FileContent)
                .where(FileContent.name.like(f"{event_id}_mesh.%%")) # pylint: disable=E1101
                .limit(1)
            )

            file = session.exec(query).one_or_none()
            if file is not None:
                file_id = file_seq_to_id(file.file_seq)
                state = GenerateMeshState.completed
            else:
                state = GenerateMeshState.failed

        return GenerateMeshStatusResponse(state=state, file_id=file_id)
