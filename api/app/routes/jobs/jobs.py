import logging
from http import HTTPStatus
from typing import Any

from cryptid.location import location
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import Session, insert, select, text, update

from cryptid.cryptid import event_seq_to_id, job_def_id_to_seq, job_def_seq_to_id, \
    job_id_to_seq, job_result_seq_to_id, job_seq_to_id, profile_seq_to_id
from config import app_config
from db.connection import get_session
from db.schema.events import Event
from db.schema.jobs import Job, JobDefinition, JobResult
from db.schema.profiles import Profile
from routes.authorization import current_profile

log = logging.getLogger(__name__)


class JobDefinitionRequest(BaseModel):
    job_type: str
    name: str
    description: str
    config: dict[str, Any]
    input_files: int
    params_schema: dict[str, Any]


class JobDefinitionResponse(BaseModel):
    job_def_id: str


class JobDefinitionModel(JobDefinitionRequest):
    job_def_id: str


class JobRequest(BaseModel):
    job_def_id: str
    input_files: list[str]
    params: dict[str, Any]


class JobResponse(BaseModel):
    job_id: str
    event_id: str
    job_def_id: str


class JobResultRequest(BaseModel):
    created_in: str
    result_data: dict[str, Any]


class JobResultCreateResponse(BaseModel):
    job_result_id: str


class JobResultModel(JobResultRequest):
    job_result_id: str


class JobResultResponse(BaseModel):
    completed: bool
    results: list[JobResultModel]


router = APIRouter(prefix="/jobs", tags=["jobs"])


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


def add_job_requested_event(session: Session, job_seq: int, job_def, input_files: list[str], params: str,
                            profile_seq: int):
    """Add a new event that triggers job processing"""
    # Create a new pipeline event
    job_id = job_seq_to_id(job_seq)
    job_data = {
        'job_def_id': job_def_seq_to_id(job_def.job_def_seq),
        'job_id': job_id,
        'profile_id': profile_seq_to_id(profile_seq),
        'config': job_def.config,
        'input_files': input_files,
        'params': params,
        'job_results_endpoint': f'{app_config().api_base_uri}/jobs/{job_id}/results'
    }
    loc = location()
    stmt = insert(Event).values(
        event_type=f"{job_def.job_type}:requested",
        job_data=job_data,
        owner_seq=profile_seq,
        created_in=loc,
        affinity=loc)
    event_result = session.exec(stmt)
    log.info("job requested for %s by %s -> %s", job_def.job_type, profile_seq, event_result)
    return event_result


@router.post('/', status_code=HTTPStatus.CREATED)
async def create_job(
        request: JobRequest,
        profile: Profile = Depends(current_profile)) -> JobResponse:
    with get_session() as session:
        job_def = session.exec(select(JobDefinition).where(
            JobDefinition.job_def_seq == job_def_id_to_seq(request.job_def_id))).one_or_none()
        if job_def is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_def_id not found")
        job = session.exec(insert(Job).values(
            job_def_seq=job_def_id_to_seq(request.job_def_id),
            owner_seq=profile.profile_seq,
            input_files=request.input_files,
            params=request.params))
        job_seq = job.inserted_primary_key[0]

        event_result = add_job_requested_event(session, job_seq, job_def, request.input_files, request.params,
                                               profile.profile_seq)
        event_id = event_seq_to_id(event_result.inserted_primary_key[0])
        session.commit()
        return JobResponse(
            job_id=job_seq_to_id(job_seq),
            event_id=event_id,
            job_def_id=request.job_def_id)


def job_result_insert(session: Session, job_seq: int, request: JobResultRequest):
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
            job_seq=job_seq,
            job_result_seq=next_job_result_seq,
            created_in=request.created_in,
            result_data=request.result_data))
    else:
        return session.exec(insert(JobResult).values(
            job_seq=job_seq,
            created_in=request.created_in,
            result_data=request.result_data))


@router.post('/results/{job_id}', status_code=HTTPStatus.CREATED)
async def create_job_result(
        job_id: str,
        request: JobResultRequest) -> JobResultCreateResponse:
    with get_session() as session:
        job_seq = job_id_to_seq(job_id)
        job = session.exec(select(Job).where(Job.job_seq == job_seq)).one_or_none()
        if job is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_id not found")

        job_result = job_result_insert(session, job_seq, request)
        job_result_seq = job_result.inserted_primary_key[0]
        session.commit()
        return JobResultCreateResponse(job_result_id=job_result_seq_to_id(job_result_seq))


@router.get('/results/{job_id}')
async def get_job_results(
        job_id: str,
        profile: Profile = Depends(current_profile)) -> JobResultResponse:
    with get_session() as session:
        job_seq = job_id_to_seq(job_id)
        job = session.exec(select(Job).where(Job.job_seq == job_seq)).one_or_none()
        if job is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_id not found")
        if job.owner_seq != profile.profile_seq:
            raise HTTPException(HTTPStatus.FORBIDDEN, detail="job_id not owned by profile")

        job_results = session.exec(select(JobResult)
                                   .where(JobResult.job_seq == job_seq)).all()
        results = [JobResultModel(job_result_id=job_result_seq_to_id(job_result.job_result_seq),
                                  **job_result.model_dump())
                   for job_result in job_results]
        return JobResultResponse(completed=(job.completed is not None), results=results)


@router.post('/complete/{job_id}')
async def set_job_completed(
        job_id: str):
    with get_session() as session:
        job_result = session.exec(update(Job)
                                  .where(Job.job_seq == job_id_to_seq(job_id))
                                  .where(Job.completed == None)
                                  .values(completed=sql_now()))
        if job_result.rowcount == 0:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_id not found or already completed")
        session.commit()
