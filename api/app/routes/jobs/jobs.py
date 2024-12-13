import logging
from datetime import datetime, timezone
from http import HTTPStatus
from typing import Any
from uuid import uuid4

import asyncio
from cryptid.cryptid import event_seq_to_id, job_def_id_to_seq, job_def_seq_to_id, \
    job_id_to_seq, job_result_seq_to_id, job_seq_to_id, profile_seq_to_id
from cryptid.location import location
from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from opentelemetry.trace.status import Status, StatusCode
from pydantic import BaseModel
from ripple.automation import NatsAdapter, WorkerRequest, process_guid
from ripple.models.params import ParameterSet, ParameterSpec, FileParameter
from ripple.models.sessions import SessionProfile
from ripple.runtime.params import repair_parameters, validate_params
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import Session, insert, select, text, update

from config import app_config
from db.connection import get_session
from db.schema.events import Event
from db.schema.jobs import Job, JobDefinition, JobResult
from db.schema.profiles import Profile
from routes.authorization import session_profile

log = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)


class JobDefinitionRequest(BaseModel):
    job_type: str
    name: str
    description: str
    params_schema: ParameterSpec


class JobDefinitionResponse(BaseModel):
    job_def_id: str


class JobDefinitionModel(JobDefinitionRequest):
    job_def_id: str


class JobRequest(BaseModel):
    job_def_id: str
    params: ParameterSet


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
async def define_new(
        request: JobDefinitionRequest) -> JobDefinitionResponse:
    """Create a new job definition"""
    with get_session() as session:
        job_def = JobDefinition(**request.model_dump())
        session.add(job_def)
        session.commit()
        session.refresh(job_def)
        return JobDefinitionResponse(job_def_id=job_def_seq_to_id(job_def.job_def_seq))


@router.get('/definitions')
async def list_definitions() -> list[JobDefinitionModel]:
    """List existing job definitions"""
    with get_session() as session:
        job_defs = session.exec(select(JobDefinition)).all()
        return [JobDefinitionModel(job_def_id=job_def_seq_to_id(job_def.job_def_seq), **job_def.model_dump())
                for job_def in job_defs]


@router.get('/definitions/{job_def_id}')
async def by_id(job_def_id: str) -> JobDefinitionModel:
    """Get job definition by id"""
    with get_session() as session:
        job_def = session.exec(select(JobDefinition).where(
            JobDefinition.job_def_seq == job_def_id_to_seq(job_def_id))).one_or_none()
        if job_def is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_def_id not found")
        return JobDefinitionModel(job_def_id=job_def_id, **job_def.model_dump())


@router.get('/def_from_file/{file_id}')
async def def_from_file(file_id: str, profile: SessionProfile = Depends(session_profile)) -> str:
    parameter_set = ParameterSet(
        hda_file = FileParameter(file_id=file_id)
    )
    work_guid = str(uuid4())
    event = WorkerRequest(
        process_guid=process_guid,
        work_guid=work_guid,
        path='/mythica/generate_job_defs',
        data=parameter_set.model_dump(),
        auth_token=profile.auth_token)
    nats = NatsAdapter()
    asyncio.create_task(nats.post("houdini", event.model_dump()))
    return work_guid


def add_job_requested_event(
        session: Session,
        job_seq: int,
        job_def,
        params: str,
        profile_seq: int,
        auth_token: str):
    """Add a new event that triggers job processing"""
    # Create a new pipeline event
    job_id = job_seq_to_id(job_seq)
    job_data = {
        'job_def_id': job_def_seq_to_id(job_def.job_def_seq),
        'job_id': job_id,
        'auth_token': auth_token,
        'profile_id': profile_seq_to_id(profile_seq),
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


async def add_job_nats_event(
        job_seq: int,
        profile_seq: int,
        auth_token: str,
        job_type: str,
        params: ParameterSet):
    """Add a new job event to the NATS message bus"""
    [subject, path] = job_type.split("::")

    event = WorkerRequest(
        process_guid=process_guid,
        work_guid=str(uuid4()),
        job_id=job_seq_to_id(job_seq),
        auth_token=auth_token,
        path=path,
        data=params.model_dump()
    )

    nats = NatsAdapter()
    await nats.post(subject, event.model_dump())


@router.post('/', status_code=HTTPStatus.CREATED)
async def create(
        request: JobRequest,
        profile: Profile = Depends(session_profile)) -> JobResponse:
    """Request a job from an existing definition"""
    with tracer.start_as_current_span("job.status") as span:
        with get_session() as session:
            job_def = session.exec(select(JobDefinition).where(
                JobDefinition.job_def_seq == job_def_id_to_seq(request.job_def_id))).one_or_none()
            if job_def is None:
                span.set_status(Status(StatusCode.ERROR, "Job definition not found"))
                raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_def_id not found")

            parameter_spec = ParameterSpec(**job_def.params_schema)
            repair_parameters(parameter_spec, request.params)
            valid = validate_params(parameter_spec, request.params)
            if not valid:
                span.set_status(Status(StatusCode.ERROR, "Invalid job parameters"))
                raise HTTPException(HTTPStatus.BAD_REQUEST, detail="Invalid params")

            job = session.exec(insert(Job).values(
                job_def_seq=job_def_id_to_seq(request.job_def_id),
                owner_seq=profile.profile_seq,
                params=request.params.model_dump()))
            job_seq = job.inserted_primary_key[0]

            span.set_attribute("job.id", job_seq_to_id(job_seq))
            span.set_attribute("job.started", datetime.now(timezone.utc).isoformat())

            event_result = add_job_requested_event(
                session,
                job_seq,
                job_def,
                request.params.model_dump(),
                profile.profile_seq,
                profile.auth_token)
            event_id = event_seq_to_id(event_result.inserted_primary_key[0])
            session.commit()

            await add_job_nats_event(
                job_seq,
                profile.profile_seq,
                profile.auth_token,
                job_def.job_type,
                request.params)

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
async def create_result(
        job_id: str,
        request: JobResultRequest) -> JobResultCreateResponse:
    """Add a new job result"""
    with tracer.start_as_current_span("job.status") as span:
        span.set_attribute("job.id", job_id)
        with get_session() as session:
            job_seq = job_id_to_seq(job_id)
            job = session.exec(select(Job).where(Job.job_seq == job_seq)).one_or_none()
            if job is None:
                span.set_status(Status(StatusCode.ERROR, "Job not found"))
                raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_id not found")

            job_result = job_result_insert(session, job_seq, request)
            span.set_attribute("job.result", request.result_data)
            span.set_attribute("job.result.time", datetime.now(timezone.utc).isoformat())
            job_result_seq = job_result.inserted_primary_key[0]
            session.commit()
            return JobResultCreateResponse(job_result_id=job_result_seq_to_id(job_result_seq))


@router.get('/results/{job_id}')
async def list_results(
        job_id: str,
        profile: Profile = Depends(session_profile)) -> JobResultResponse:
    """List results for a job"""
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
async def set_complete(
        job_id: str):
    """Mark a job as complete"""
    with tracer.start_as_current_span("job.status") as span:
        span.set_attribute("job.id", job_id)
        with get_session() as session:
            job_result = session.exec(update(Job)
                                      .where(Job.job_seq == job_id_to_seq(job_id))
                                      .where(Job.completed == None)
                                      .values(completed=sql_now()))
            if job_result.rowcount == 0:
                span.set_status(Status(StatusCode.ERROR, "Job not found or already completed"))
                log.error("Job %s not found or already completed", job_id)
                raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_id not found or already completed")

            span.set_attribute("job.completed", datetime.now(timezone.utc).isoformat())
            span.set_status(Status(StatusCode.OK))
            session.commit()

