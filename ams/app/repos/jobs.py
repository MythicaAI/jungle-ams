import logging
import sys
from collections import defaultdict
from datetime import datetime, timezone
from http import HTTPStatus
from uuid import uuid4

from fastapi import Depends, HTTPException
from opentelemetry import trace
from opentelemetry.context import get_current as get_current_telemetry_context
from opentelemetry.trace.status import Status, StatusCode
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import insert, select, text, update
from sqlmodel.ext.asyncio.session import AsyncSession

from config import app_config
from cryptid.cryptid import (
    asset_id_to_seq, event_seq_to_id,
    job_def_id_to_seq,
    job_def_seq_to_id,
    job_id_to_seq,
    job_result_seq_to_id,
    job_seq_to_id,
    profile_seq_to_id,
)
from cryptid.location import location
from db.connection import get_db_session
from db.schema.assets import AssetVersionEntryPoint
from db.schema.events import Event
from db.schema.jobs import Job, JobDefinition, JobResult
from db.schema.profiles import Profile
from repos.assets import AssetVersionResult
from ripple.auth import roles
from ripple.auth.authorization import validate_roles
from ripple.automation.adapters import NatsAdapter
from ripple.automation.models import AutomationRequest
from ripple.automation.worker import process_guid
from ripple.models.params import ParameterSet, ParameterSpec
from ripple.models.sessions import SessionProfile
from ripple.runtime.params import ParamError, repair_parameters, validate_params
from routes.authorization import session_profile
from routes.jobs.models import ExtendedJobResultResponse, JobRequest, JobResponse, \
    JobResultCreateResponse, JobResultModel, JobResultRequest, JobResultResponse
from telemetry_config import get_telemetry_headers

log = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)


def disable_nats(context_str):
    if "pytest" in sys.argv[0] or "pytest" in sys.modules:
        log.info("skipping post to NATS in test: %s", context_str)
        return True
    return False


async def add_job_requested_event(
        db_session: AsyncSession,
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
    event_result = await db_session.exec(stmt)
    log.info("job requested for %s by %s -> %s", job_def.job_type, profile_seq, event_result)
    return event_result


async def add_job_nats_event(
        job_seq: int,
        profile_id: str,
        auth_token: str,
        job_type: str,
        params: ParameterSet):
    """Add a new job event to the NATS message bus"""
    if disable_nats(job_type):
        return

    [subject, path] = job_type.split("::")

    event = AutomationRequest(
        process_guid=process_guid,
        correlation=str(uuid4()),
        results_subject=profile_id,
        job_id=job_seq_to_id(job_seq),
        auth_token=auth_token,
        path=path,
        data=params.model_dump(),
        telemetry_context=get_telemetry_headers(),
    )

    nats = NatsAdapter()
    log.info("Sent NATS %s task. Request: %s", str(subject), event.model_dump())
    await nats.post(subject, event.model_dump())


async def create(
        req_data: JobRequest,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> JobResponse:
    """
    Request a job from an existing definition
    """
    if req_data.interactive:
        validate_roles(role=roles.job_create_interactive, auth_roles=profile.auth_roles)

    span = trace.get_current_span(context=get_current_telemetry_context())
    job_def = (await db_session.exec(select(JobDefinition).where(
        JobDefinition.job_def_seq == job_def_id_to_seq(req_data.job_def_id)))).one_or_none()
    if job_def is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_def_id not found")

    if req_data.interactive and not job_def.interactive:
        raise HTTPException(HTTPStatus.FORBIDDEN,
                            detail=f"{req_data.job_def_id} definition does not allow interactive jobs")

    parameter_spec = ParameterSpec(**job_def.params_schema)
    repair_parameters(parameter_spec, req_data.params)
    # validate parameters, report back the parameter error that caused the problem
    try:
        validate_params(parameter_spec, req_data.params)
    except ParamError as e:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail=str(e)) from e

    job_result = await db_session.exec(insert(Job).values(
        job_def_seq=job_def_id_to_seq(req_data.job_def_id),
        owner_seq=profile.profile_seq,
        params=req_data.params.model_dump()))
    job_seq = job_result.inserted_primary_key[0]

    span.set_attribute("job.id", job_seq_to_id(job_seq))
    span.set_attribute("job.started", datetime.now(timezone.utc).isoformat())

    event_result = await add_job_requested_event(
        db_session,
        job_seq,
        job_def,
        req_data.params.model_dump(),
        profile.profile_seq,
        profile.auth_token)
    event_id = event_seq_to_id(event_result.inserted_primary_key[0])
    await db_session.commit()

    await add_job_nats_event(
        job_seq,
        profile.profile_id,
        profile.auth_token,
        job_def.job_type,
        req_data.params)

    return JobResponse(
        job_id=job_seq_to_id(job_seq),
        event_id=event_id,
        job_def_id=req_data.job_def_id)


async def job_result_insert(
        db_session: AsyncSession,
        job_seq: int,
        req_data: JobResultRequest):
    """
    Generate the job result insert with fallback for databases without sequences
    support on composite primary keys
    """
    engine = db_session.get_bind()
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
        next_job_result_seq = (await db_session.exec(
            statement=upsert_query,
            params={"name": "job_result_seq_seq"})).scalar()

        return await db_session.exec(insert(JobResult).values(
            job_seq=job_seq,
            job_result_seq=next_job_result_seq,
            created_in=req_data.created_in,
            result_data=req_data.result_data))
    else:
        return await db_session.exec(insert(JobResult).values(
            job_seq=job_seq,
            created_in=req_data.created_in,
            result_data=req_data.result_data))


async def create_result(job_id: str, req_data: JobResultRequest, db_session: AsyncSession):
    """
    Create a new job result
    """
    span = trace.get_current_span(context=get_current_telemetry_context())
    span.set_attribute("job.id", job_id)

    job_seq = job_id_to_seq(job_id)
    job = (await db_session.exec(select(Job).where(Job.job_seq == job_seq))).one_or_none()
    if job is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_id not found")

    job_result = await job_result_insert(db_session, job_seq, req_data)
    if req_data.result_data:
        span.set_attributes(req_data.result_data)
    span.set_attribute("job.result.time", datetime.now(timezone.utc).isoformat())
    job_result_seq = job_result.inserted_primary_key[1]
    await db_session.commit()
    return JobResultCreateResponse(job_result_id=job_result_seq_to_id(job_result_seq))


async def list_results(
        job_id: str,
        profile: Profile,
        db_session: AsyncSession):
    """List job and results by ID"""
    job_seq = job_id_to_seq(job_id)
    job = (await db_session.exec(select(Job).where(Job.job_seq == job_seq))).one_or_none()
    if job is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_id not found")
    if job.owner_seq != profile.profile_seq:
        raise HTTPException(HTTPStatus.FORBIDDEN, detail="job_id not owned by profile")

    job_results = (await db_session.exec(select(JobResult)
                                         .where(JobResult.job_seq == job_seq))).all()
    results = [JobResultModel(job_result_id=job_result_seq_to_id(job_result.job_result_seq),
                              **job_result.model_dump())
               for job_result in job_results]
    return JobResultResponse(
        created=job.created,
        completed=(job.completed is not None),
        job_def_id=job_def_seq_to_id(job.job_def_seq) if job.job_def_seq else None,
        results=results)


async def complete_job(job_id: str, db_session: AsyncSession):
    """Mark the job as completed"""
    span = trace.get_current_span(context=get_current_telemetry_context())
    span.set_attribute("job.id", job_id)
    job_result = await db_session.exec(update(Job)
                                       .where(Job.job_seq == job_id_to_seq(job_id))
                                       .where(Job.completed == None)
                                       .values(completed=sql_now()))
    if job_result.rowcount == 0:
        log.error("Job %s not found or already completed", job_id)
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_id not found or already completed")

    span.set_attribute("job.completed", datetime.now(timezone.utc).isoformat())
    span.set_status(Status(StatusCode.OK))
    await db_session.commit()


async def resolve_jobs_from_job_definitions(
        db_session: AsyncSession,
        avr: AssetVersionResult) -> list[ExtendedJobResultResponse]:
    results = (await db_session.exec(
        select(Job, JobResult)
        .select_from(JobDefinition)
        .select_from(AssetVersionEntryPoint)
        .outerjoin(AssetVersionEntryPoint, AssetVersionEntryPoint.job_def_seq == JobDefinition.job_def_seq)
        .outerjoin(Job, Job.job_def_seq == JobDefinition.job_def_seq)
        .outerjoin(JobResult, JobResult.job_seq == Job.job_seq)
        .where(Job.job_def_seq != None)
        .where(AssetVersionEntryPoint.asset_seq == asset_id_to_seq(avr.asset_id))
        .where(AssetVersionEntryPoint.major == avr.version[0])
        .where(AssetVersionEntryPoint.minor == avr.version[1])
        .where(AssetVersionEntryPoint.patch == avr.version[2])
    )).all()
    if not results:
        return []

    jobs_dict = defaultdict(list)
    for job, job_result in results:
        jobs_dict[job.job_seq].append(job_result)

    jobs = []
    for job_seq, job_results in jobs_dict.items():
        job = next(job for job, _ in results if job.job_seq == job_seq)
        jobs.append(
            ExtendedJobResultResponse(
                job_id=job_seq_to_id(job.job_seq),
                created=job.created,
                completed=job.completed,
                job_def_id=(
                    job_def_seq_to_id(job.job_def_seq) if job.job_def_seq else None
                ),
                params=job.params,
                results=[
                    JobResultModel(
                        job_result_id=job_result_seq_to_id(job_result.job_result_seq),
                        **job_result.model_dump(),
                    )
                    for job_result in job_results if job_result is not None
                ] if job_results else None,
            )
        )

    return jobs
