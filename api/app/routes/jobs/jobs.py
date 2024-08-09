import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends
from sqlmodel import Session, select, desc, insert
from pydantic import BaseModel

from auth.api_id import event_seq_to_id, event_id_to_seq, file_id_to_seq, file_seq_to_id, profile_seq_to_id
from config import app_config
from db.connection import get_session
from db.schema.events import Event
from db.schema.media import FileContent
from db.schema.profiles import Profile
from routes.authorization import current_profile

log = logging.getLogger(__name__)

class GenerateMeshRequest(BaseModel):
    file_id: str
    params: dict[str, str]

class GenerateMeshResponse(BaseModel):
    event_id: str

class GenerateMeshStatusResponse(BaseModel):
    file_id: str

router = APIRouter(prefix="/jobs", tags=["jobs"])

def add_generate_mesh_event(session: Session, request: GenerateMeshRequest, profile_seq: int):
    """Add a new event that triggers mesh generation"""
    # Create a new pipeline event
    job_data = {
        'file_id': request.file_id,
        'profile_id': profile_seq_to_id(profile_seq),
        'params': request.params
    }
    print(f"JobData: {job_data}")
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

@router.post("/generate-mesh")
async def generate_mesh_file_by_id(
    request: GenerateMeshRequest,
    profile: Profile = Depends(current_profile)) -> GenerateMeshResponse:
    """Generates a mesh based on the file content"""

    file_seq = file_id_to_seq(request.file_id)
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

    event_seq = event_id_to_seq(event_id)

    with get_session() as session:
        event = session.exec(select(Event).where(Event.event_seq == event_seq)).one_or_none()
        if event.completed is not None:
            # HACK: Add method of associating resulting mesh with event
            query = (
                select(FileContent)
                .where(FileContent.name.like('%.fbx'))
                .order_by(desc(FileContent.created))
                .limit(1)
            )

            file = session.exec(query).one_or_none()
            if file is not None:
                return GenerateMeshStatusResponse(file_id=file_seq_to_id(file.file_seq))

    return GenerateMeshStatusResponse(file_id="")
