import logging
from enum import Enum
from http import HTTPStatus
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, insert, select, text

from auth.api_id import event_id_to_seq, event_seq_to_id, file_seq_to_id, job_def_id_to_seq, job_def_seq_to_id, \
    job_id_to_seq, job_result_seq_to_id, job_seq_to_id, profile_seq_to_id
from config import app_config
from db.connection import get_session
from db.schema.events import Event
from db.schema.jobs import Job, JobDefinition, JobResult
from db.schema.media import FileContent
from db.schema.profiles import Profile
from routes.authorization import current_profile

log = logging.getLogger(__name__)


class GenerateMeshRequest(BaseModel):
    file_id: str
    params: dict[str, Any]


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
        'params': request.params
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
            .where(FileContent.name.like(f"{file_id}_interface.json"))  # pylint: disable=E1101
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
                .where(FileContent.name.like(f"{event_id}_mesh.%%"))  # pylint: disable=E1101
                .limit(1)
            )

            file = session.exec(query).one_or_none()
            if file is not None:
                file_id = file_seq_to_id(file.file_seq)
                state = GenerateMeshState.completed
            else:
                state = GenerateMeshState.failed

        return GenerateMeshStatusResponse(state=state, file_id=file_id)


class JobDefinitionRequest(BaseModel):
    job_type: str
    name: str
    description: str
    config: dict[str, Any]
    params_schema: dict[str, Any]


class JobDefinitionResponse(BaseModel):
    job_def_id: str


class JobDefinitionModel(JobDefinitionRequest):
    job_def_id: str


class JobRequest(BaseModel):
    job_def_id: str
    params: dict[str, Any]


class JobResponse(BaseModel):
    job_id: str
    job_def_id: str


class JobResultRequest(BaseModel):
    created_in: str
    result_data: dict[str, Any]


class JobResultResponse(BaseModel):
    job_result_id: str


class JobResultModel(JobResultRequest):
    job_id: str
    job_result_id: str


@router.post('/definitions', status_code=HTTPStatus.CREATED)
async def create_job_def(
        request: JobDefinitionRequest) -> JobDefinitionResponse:
    with get_session() as session:
        job_def = JobDefinition(**request.model_dump())
        session.add(job_def)
        session.commit()
        session.refresh(job_def)
        return JobDefinitionResponse(job_def_id=job_def_seq_to_id(job_def.job_def_seq))


@router.get('/definitions')
async def get_job_defs() -> list[JobDefinitionModel]:
    with get_session() as session:
        job_defs = session.exec(select(JobDefinition)).all()
        return [JobDefinitionModel(job_def_id=job_def_seq_to_id(job_def.job_def_seq), **job_def.model_dump())
                for job_def in job_defs]


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_job(
        request: JobRequest) -> JobResponse:
    with get_session() as session:
        job = session.exec(insert(Job).values(
            job_def_seq=job_def_id_to_seq(request.job_def_id),
            params=request.params))
        job_seq = job.inserted_primary_key[0]
        session.commit()
        return JobResponse(
            job_id=job_seq_to_id(job_seq),
            job_def_id=request.job_def_id)


def job_result_insert(session: Session, job_id: str, request: JobResultRequest):
    """Generate the job result insert with fallback for databases without sequences
    support on composite primary keys"""
    from db.connection import engine
    # fallback for composite primary key auto increment in SQLite
    # see the db connection code for the definition of this fallback
    requires_app_sequences = {'sqlite'}
    if engine.dialect.name in requires_app_sequences:
        # generate the next sequence value, uses a custom upsert as this pattern is not
        # natively supported in SQLAlchemy
        upsert_query = text("""
                    INSERT INTO app_sequences (name) VALUES (:name)
                    ON CONFLICT(name) DO UPDATE SET seq = seq + 1
                    RETURNING seq;
                """)
        next_job_result_seq = session.exec(
            statement=upsert_query,
            params={"name": "job_result_seq_seq"}).scalar()

        return session.exec(insert(JobResult).values(
            job_seq=job_id_to_seq(job_id),
            job_result_seq=next_job_result_seq,
            created_in=request.created_in,
            result_data=request.result_data))
    else:
        return session.exec(insert(JobResult).values(
            job_seq=job_id_to_seq(job_id),
            created_in=request.created_in,
            result_data=request.result_data))


@router.post('/results/{job_id}', status_code=HTTPStatus.CREATED)
async def create_job_result(
        job_id: str,
        request: JobResultRequest) -> JobResultResponse:
    with get_session() as session:
        job_result = job_result_insert(session, job_id, request)
        job_result_seq = job_result.inserted_primary_key[0]
        session.commit()
        return JobResultResponse(job_result_id=job_result_seq_to_id(job_result_seq))


@router.get('/results/{job_id}')
async def get_job_results(job_id: str) -> list[JobResultModel]:
    with get_session() as session:
        job_results = session.exec(select(JobResult)
                                   .where(JobResult.job_seq == job_id_to_seq(job_id))).all()
        return [JobResultModel(job_id=job_seq_to_id(job_result.job_seq),
                               job_result_id=job_result_seq_to_id(job_result.job_result_seq),
                               **job_result.model_dump())
                for job_result in job_results]
