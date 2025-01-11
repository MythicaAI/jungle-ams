from urllib.error import HTTPError

import logging
from datetime import datetime, timezone
from http import HTTPStatus
from typing import Any, Optional
from uuid import uuid4

from config import app_config
import sys

from assets import repo
from assets.repo import AssetVersionResult
from cryptid.cryptid import asset_id_to_seq, event_seq_to_id, file_id_to_seq, job_def_id_to_seq, job_def_seq_to_id, \
    job_id_to_seq, job_result_seq_to_id, job_seq_to_id, profile_seq_to_id
from cryptid.location import location
from db.connection import get_session
from db.schema.events import Event
from db.schema.jobs import Job, JobDefinition, JobResult
from db.schema.profiles import Profile
from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from opentelemetry.trace.status import Status, StatusCode
from pydantic import BaseModel

from db.schema.media import FileJobDef
from ripple.auth import roles
from ripple.auth.authorization import Scope, validate_roles
from ripple.automation.adapters import NatsAdapter
from ripple.automation.models import AutomationRequest
from ripple.automation.worker import process_guid
from ripple.models.params import FileParameter, ParameterSet, ParameterSpec
from ripple.models.sessions import SessionProfile
from ripple.models.streaming import JobDefinition as JobDefinitionRef
from ripple.runtime.params import repair_parameters, validate_params
from routes.authorization import maybe_session_profile, session_profile
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import Session, col
from sqlmodel import delete as sql_delete
from sqlmodel import insert, select, text, update
from telemetry_config import get_telemetry_context

log = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)


class JobDefinitionRequest(BaseModel):
    job_type: str
    name: str
    description: str
    params_schema: ParameterSpec
    src_file_id: Optional[str]


class JobDefinitionResponse(BaseModel):
    job_def_id: str
    job_type: str
    description: str
    params_schema: ParameterSpec
    src_file_id: Optional[str]


class JobDefinitionModel(JobDefinitionRequest):
    job_def_id: str
    owner_id: str | None = None


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


def disable_nats(context_str):
    if "pytest" in sys.argv[0] or "pytest" in sys.modules:
        log.info("skipping post to NATS in test: %s", context_str)
        return True
    return False


@router.post('/definitions', status_code=HTTPStatus.CREATED)
async def define_new(
        request: JobDefinitionRequest,
        profile: SessionProfile = Depends(maybe_session_profile)) -> JobDefinitionResponse:
    """Create a new job definition"""
    with get_session() as session:
        values = request.model_dump()

        # convert the optional src_file_id to foreign key sequence
        src_file_id = values.pop('src_file_id')
        if src_file_id is not None:
            src_file_seq = file_id_to_seq(src_file_id)
            values['src_file_seq'] = src_file_seq

        # store the calling profile as the owner
        if profile:
            values["owner_seq"] = profile.profile_seq

        # insert the job definition
        result = session.exec(insert(JobDefinition).values(**values))
        session.commit()
        job_def_seq = result.inserted_primary_key[0]

        # insert the link from the file to the generated job definition
        file_job_def = FileJobDef(
          src_file_seq=src_file_seq,
          job_def_seq=int(job_def_seq))
        session.exec(insert(FileJobDef).values(**file_job_def.model_dump()))
        session.commit()

        # read back the job definition
        result = session.exec(select(JobDefinition).where(
            JobDefinition.job_def_seq == int(job_def_seq))).one_or_none()

        return JobDefinitionResponse(
            job_def_id=job_def_seq_to_id(job_def_seq),
            **result)


@router.get('/definitions')
async def list_definitions() -> list[JobDefinitionModel]:
    """List existing job definitions"""
    with get_session() as session:
        job_defs = session.exec(select(JobDefinition)).all()
        return [JobDefinitionModel(
            job_def_id=job_def_seq_to_id(job_def.job_def_seq),
            owner_id=profile_seq_to_id(job_def.owner_seq), **job_def.model_dump())
            for job_def in job_defs
        ]

def resolve_job_definitions(session: Session, avr: AssetVersionResult) -> list[JobDefinitionModel]:
    """
    Convert the file references in the asset
    """
    results = []
    for file_info in avr.contest['files']:
        file_seq = file_id_to_seq(file_info.file_id)
        job_def = session.exec(select(FileJobDef).where(FileJobDef.src_file_seq == file_seq)).one_or_none()
        if job_def:
            results.append(
                JobDefinitionModel(
                    job_def_id=job_def_seq_to_id(job_def.job_def_seq),
                    **job_def.model_dump()))
    return results


@router.get('/definitions/by_asset/{asset_id}')
async def by_latest_asset(asset_id: str) -> list[JobDefinitionModel]:
    with get_session() as session:
        asset_seq = asset_id_to_seq(asset_id)
        latest_version = repo.latest_version(session, asset_seq)
        if latest_version is None:
            raise HTTPError(HTTPStatus.NOT_FOUND, f"asset {asset_id} not found")
        return resolve_job_definitions(session, latest_version)


@router.get('/definitions/by_asset/{asset_id}/versions/{major}/{minor}/{patch}')
async def by_asset_version(asset_id: str, major: int, minor: int, patch: int) -> list[JobDefinitionModel]:
    with get_session() as session:
        asset_seq = asset_id_to_seq(asset_id)
        asset_version = repo.version(session, asset_seq, major, minor, patch)
        if asset_version is None:
            raise HTTPError(HTTPStatus.NOT_FOUND, f"asset {asset_id}-{major}.{minor}.{patch} not found")
        return resolve_job_definitions(session, asset_version)


@router.get('/definitions/{job_def_id}')
async def by_id(job_def_id: str) -> JobDefinitionModel:
    """Get job definition by id"""
    with get_session() as session:
        job_def = session.exec(select(JobDefinition).where(
            JobDefinition.job_def_seq == job_def_id_to_seq(job_def_id))).one_or_none()
        if job_def is None:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_def_id not found")
        return JobDefinitionModel(job_def_id=job_def_id, owner_id=profile_seq_to_id(job_def.owner_seq), **job_def.model_dump())


@router.get('/definitions/generate/{file_id}')
async def def_from_file(file_id: str, profile: SessionProfile = Depends(session_profile)) -> str:
    """Use an uploaded file to create a job definition"""
    if disable_nats(f"def_from_file: {file_id}"):
        return ""

    parameter_set = ParameterSet(
        hda_file=FileParameter(file_id=file_id)
    )
    work_guid = str(uuid4())
    event = AutomationRequest(
        process_guid=process_guid,
        work_guid=work_guid,
        path='/mythica/generate_job_defs',
        data=parameter_set.model_dump(),
        auth_token=profile.auth_token,
        telemetry_context=get_telemetry_context(),
    )
    nats = NatsAdapter()
    await nats.post("houdini", event.model_dump())
    return work_guid


def add_job_requested_event(
        session: Session,
        job_seq: int,
        job_def,
        params: dict,
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
        auth_token: str,
        job_type: str,
        params: ParameterSet):
    """Add a new job event to the NATS message bus"""
    if disable_nats(job_type):
        return

    [subject, path] = job_type.split("::")

    event = AutomationRequest(
        process_guid=process_guid,
        work_guid=str(uuid4()),
        job_id=job_seq_to_id(job_seq),
        auth_token=auth_token,
        path=path,
        data=params.model_dump(),
        telemetry_context=get_telemetry_context(),
    )

    nats = NatsAdapter()
    log.info("Sent NATS %s task. Request: %s", str(subject), event.model_dump())
    await nats.post(subject, event.model_dump())


@router.post('/', status_code=HTTPStatus.CREATED)
async def create(
        request: JobRequest,
        profile: SessionProfile = Depends(session_profile)) -> JobResponse:
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
            if request.result_data:
                span.set_attributes(request.result_data)
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


@router.delete('/definitions/delete_canary_jobs_def')
async def delete_canary_jobs_def(profile: SessionProfile = Depends(session_profile)):
    """Delete profile's job_defs"""

    with get_session() as session:
        job_defs_to_delete: list[JobDefinition] = session.exec(
            select(JobDefinition)
            .where(JobDefinition.job_type == "houdini::/mythica/generate_mesh")
            .where(JobDefinition.name == "Generate test_scale_input")
            .where(JobDefinition.description == "test_scale_input")
        ).all()

        if not job_defs_to_delete:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="No matching JobDefinition entries found")

        job_def_seqs_delete = []
        for job_def in job_defs_to_delete:
            scope = Scope(
                profile=profile,
                job_def=JobDefinitionRef(
                    job_def_id=job_def_seq_to_id(job_def.job_def_seq),
                    job_type=job_def.job_type,
                    name=job_def.name,
                    description=job_def.description,
                    parameter_spec=job_def.params_schema,
                    owner_id=profile_seq_to_id(job_def.owner_seq),
                )
            )
            validate_roles(role=roles.job_def_all, auth_roles=profile.auth_roles, scope=scope, is_canary=True)
            job_def_seqs_delete.append(job_def.job_def_seq)

        try:
            session.exec(
                update(Job)
                .where(col(Job.job_def_seq).in_(job_def_seqs_delete))  # pylint: disable=no-member
                .values(job_def_seq=None)
            )
            session.exec(
                sql_delete(JobDefinition)
                .where(col(JobDefinition.job_def_seq).in_(job_def_seqs_delete))  # pylint: disable=no-member
            )
            session.commit()
            log.info("Deleted JobDefinitions, ids:%s", job_def_seqs_delete)
        except Exception as ex:
            raise HTTPException(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete JobDefinition entries: {str(ex)}"
            ) from ex
    return {
        "message": f"Successfully deleted JobDefinition for profile:{profile.profile_id} and nullified references in Jobs"
    }
