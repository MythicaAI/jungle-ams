import logging
import sys
from datetime import datetime, timezone
from http import HTTPStatus
from typing import Any, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from opentelemetry.context import get_current as get_current_telemetry_context
from opentelemetry.trace.status import Status, StatusCode
from pydantic import BaseModel
from sqlalchemy.sql.functions import now as sql_now
from sqlmodel import col, delete as sql_delete, insert, select, text, update
from sqlmodel.ext.asyncio.session import AsyncSession

from assets import repo
from assets.repo import AssetVersionResult
from config import app_config
from cryptid.cryptid import (
    asset_id_to_seq,
    event_seq_to_id,
    file_id_to_seq,
    file_seq_to_id,
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
from ripple.auth import roles
from ripple.auth.authorization import Scope, validate_roles
from ripple.automation.adapters import NatsAdapter
from ripple.automation.models import AutomationRequest
from ripple.automation.worker import process_guid
from ripple.models.assets import AssetVersionEntryPointReference
from ripple.models.params import FileParameter, ParameterSet, ParameterSpec
from ripple.models.sessions import SessionProfile
from ripple.models.streaming import JobDefinition as JobDefinitionRef
from ripple.runtime.params import ParamError, repair_parameters, validate_params
from routes.authorization import maybe_session_profile, session_profile
from telemetry_config import get_telemetry_headers

log = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)


class JobDefinitionRequest(BaseModel):
    job_type: str
    name: str
    description: str
    params_schema: ParameterSpec
    source: Optional[AssetVersionEntryPointReference] = None


class JobDefinitionResponse(BaseModel):
    job_def_id: str


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
    job_def_id: Optional[str]
    created: datetime
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
        req_data: JobDefinitionRequest,
        profile: SessionProfile = Depends(maybe_session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> JobDefinitionResponse:
    """Create a new job definition"""
    # Create the job definition
    req_model = req_data.model_dump()
    if profile:
        req_model["owner_seq"] = profile.profile_seq
    job_def = JobDefinition(**req_model)
    db_session.add(job_def)
    await db_session.commit()
    await db_session.refresh(job_def)
    job_def_seq = job_def.job_def_seq

    # Create the asset version link
    if req_data.source:
        asset_version_entry_point = AssetVersionEntryPoint(
            asset_seq=asset_id_to_seq(req_data.source.asset_id),
            major=req_data.source.major,
            minor=req_data.source.minor,
            patch=req_data.source.patch,
            src_file_seq=file_id_to_seq(req_data.source.file_id),
            entry_point=req_data.source.entry_point,
            job_def_seq=job_def_seq
        )
        await db_session.merge(asset_version_entry_point)
        await db_session.commit()

    return JobDefinitionResponse(job_def_id=job_def_seq_to_id(job_def_seq))


@router.get('/definitions')
async def list_definitions(db_session: AsyncSession = Depends(get_db_session)) -> list[JobDefinitionModel]:
    """List existing job definitions"""
    job_defs = (await db_session.exec(select(JobDefinition))).all()
    return [JobDefinitionModel(
        job_def_id=job_def_seq_to_id(job_def.job_def_seq),
        owner_id=profile_seq_to_id(job_def.owner_seq) if job_def.owner_seq is not None else None,
        **job_def.model_dump())
        for job_def in job_defs
    ]


async def resolve_job_definitions(
        db_session: AsyncSession,
        avr: AssetVersionResult) -> list[JobDefinitionModel]:
    results = (await db_session.exec(
        select(AssetVersionEntryPoint, JobDefinition)
        .outerjoin(JobDefinition, AssetVersionEntryPoint.job_def_seq == JobDefinition.job_def_seq)
        .where(AssetVersionEntryPoint.asset_seq == asset_id_to_seq(avr.asset_id))
        .where(AssetVersionEntryPoint.major == avr.version[0])
        .where(AssetVersionEntryPoint.minor == avr.version[1])
        .where(AssetVersionEntryPoint.patch == avr.version[2])
    )).all()
    if not results:
        return []

    job_defs = []
    for entry_point, job_def in results:
        source = AssetVersionEntryPointReference(
            asset_id=avr.asset_id,
            major=avr.version[0],
            minor=avr.version[1],
            patch=avr.version[2],
            file_id=file_seq_to_id(entry_point.src_file_seq),
            entry_point=entry_point.entry_point
        )
        job_defs.append(JobDefinitionModel(
            job_def_id=job_def_seq_to_id(job_def.job_def_seq),
            owner_id=profile_seq_to_id(job_def.owner_seq) if job_def.owner_seq is not None else None,
            source=source,
            **job_def.model_dump()
        ))

    return job_defs


@router.get('/definitions/by_asset/{asset_id}')
async def by_latest_asset(
        asset_id: str,
        db_session: AsyncSession = Depends(get_db_session)) -> list[JobDefinitionModel]:
    asset_seq = asset_id_to_seq(asset_id)
    latest_version = await repo.latest_version(db_session, asset_seq)
    if latest_version is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, f"asset {asset_id} not found")
    return await resolve_job_definitions(db_session, latest_version)


@router.get('/definitions/by_asset/{asset_id}/versions/{major}/{minor}/{patch}')
async def by_asset_version(
        asset_id: str,
        major: int,
        minor: int,
        patch: int,
        db_session: AsyncSession = Depends(get_db_session)) -> list[JobDefinitionModel]:
    asset_seq = asset_id_to_seq(asset_id)
    asset_version = await repo.get_version(db_session, asset_seq, major, minor, patch)
    if asset_version is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, f"asset {asset_id}-{major}.{minor}.{patch} not found")
    return await resolve_job_definitions(db_session, asset_version)


@router.get('/definitions/{job_def_id}')
async def by_id(
        job_def_id: str,
        db_session: AsyncSession = Depends(get_db_session)) -> JobDefinitionModel:
    """Get job definition by id"""
    job_def = (await db_session.exec(select(JobDefinition).where(
        JobDefinition.job_def_seq == job_def_id_to_seq(job_def_id)))).one_or_none()
    if job_def is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_def_id not found")
    return JobDefinitionModel(
        job_def_id=job_def_id,
        owner_id=profile_seq_to_id(job_def.owner_seq) if job_def.owner_seq is not None else None,
        **job_def.model_dump()
    )


@router.get('/def_from_file/{file_id}')
async def def_from_file(file_id: str, profile: SessionProfile = Depends(session_profile)) -> str:
    """Convert a file to a job definition"""
    if disable_nats(f"def_from_file: {file_id}"):
        return ""

    parameter_set = ParameterSet(
        hda_file=FileParameter(file_id=file_id),
        src_asset_id="",
        src_version=[0, 0, 0]
    )
    correlation = str(uuid4())
    event = AutomationRequest(
        process_guid=process_guid,
        correlation=correlation,
        path='/mythica/generate_job_defs',
        data=parameter_set.model_dump(),
        auth_token=profile.auth_token,
        telemetry_context=get_telemetry_headers(),
    )
    nats = NatsAdapter()
    await nats.post("houdini", event.model_dump())
    return correlation


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


@router.post('/', status_code=HTTPStatus.CREATED)
async def create(
        req_data: JobRequest,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> JobResponse:
    """Request a job from an existing definition"""
    span = trace.get_current_span(context=get_current_telemetry_context())
    job_def = (await db_session.exec(select(JobDefinition).where(
        JobDefinition.job_def_seq == job_def_id_to_seq(req_data.job_def_id)))).one_or_none()
    if job_def is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_def_id not found")

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
    """Generate the job result insert with fallback for databases without sequences
    support on composite primary keys"""
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


@router.post('/results/{job_id}', status_code=HTTPStatus.CREATED)
async def create_result(
        job_id: str,
        req_data: JobResultRequest,
        db_session: AsyncSession = Depends(get_db_session)) -> JobResultCreateResponse:
    """Add a new job result"""
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
    job_result_seq = job_result.inserted_primary_key[0]
    await db_session.commit()
    return JobResultCreateResponse(job_result_id=job_result_seq_to_id(job_result_seq))


@router.get('/results/{job_id}')
async def list_results(
        job_id: str,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> JobResultResponse:
    """List results for a job"""
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


@router.post('/complete/{job_id}')
async def set_complete(
        job_id: str,
        db_session: AsyncSession = Depends(get_db_session)):
    """Mark a job as complete"""
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


@router.delete('/definitions/delete_canary_jobs_def')
async def delete_canary_jobs_def(
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)):
    """Delete profile's job_defs"""
    job_defs_to_delete: list[JobDefinition] = (await db_session.exec(
        select(JobDefinition)
        .where(JobDefinition.job_type == "houdini::/mythica/generate_mesh")
        .where(JobDefinition.name == "Generate test_scale_input")
        .where(JobDefinition.description == "test_scale_input")
    )).all()

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
        await db_session.exec(
            update(Job)
            .where(col(Job.job_def_seq).in_(job_def_seqs_delete))  # pylint: disable=no-member
            .values(job_def_seq=None)
        )
        await db_session.exec(
            sql_delete(JobDefinition)
            .where(col(JobDefinition.job_def_seq).in_(job_def_seqs_delete))  # pylint: disable=no-member
        )
        await db_session.commit()
        log.info("Deleted JobDefinitions, ids:%s", job_def_seqs_delete)
    except Exception as ex:
        raise HTTPException(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete JobDefinition entries: {str(ex)}"
        ) from ex
    return {
        "message": f"Successfully deleted JobDefinition for profile:{profile.profile_id} and nullified references in Jobs"
    }
