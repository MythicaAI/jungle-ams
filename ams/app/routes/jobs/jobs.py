import logging
from http import HTTPStatus

from fastapi import Depends, HTTPException
from opentelemetry import trace
from sqlmodel import col, delete as sql_delete, select, update
from sqlmodel.ext.asyncio.session import AsyncSession

from cryptid.cryptid import (
    asset_id_to_seq,
    job_def_seq_to_id,
    profile_seq_to_id,
)
from db.connection import get_db_session
from db.schema.jobs import Job, JobDefinition
from db.schema.profiles import Profile
from repos import assets, jobs
from ripple.auth import roles
from ripple.auth.authorization import Scope, validate_roles
from ripple.models.sessions import SessionProfile
from ripple.models.streaming import JobDefinition as JobDefinitionRef
from routes.authorization import session_profile
from routes.jobs.models import ExtendedJobResultResponse, \
    JobRequest, JobResponse, \
    JobResultCreateResponse, JobResultRequest, JobResultResponse

log = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)

# workaround to get the default route loader to pick up job defs
from routes.jobs.job_defs import __force_import__
from routes.jobs.router import router

__force_imports__ = [__force_import__]


@router.post('/', status_code=HTTPStatus.CREATED)
async def create(
        req_data: JobRequest,
        profile: SessionProfile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> JobResponse:
    """Request a job from an existing definition"""
    if req_data.interactive:
        validate_roles(role=roles.job_create_interactive, auth_roles=profile.auth_roles)
    return await jobs.create(req_data, profile, db_session)


@router.post('/results/{job_id}', status_code=HTTPStatus.CREATED)
async def create_result(
        job_id: str,
        req_data: JobResultRequest,
        db_session: AsyncSession = Depends(get_db_session)) -> JobResultCreateResponse:
    """Add a new job result"""
    return await jobs.create_result(job_id, req_data, db_session)


@router.get('/results/{job_id}')
async def list_results(
        job_id: str,
        profile: Profile = Depends(session_profile),
        db_session: AsyncSession = Depends(get_db_session)) -> JobResultResponse:
    """List results for a job"""
    return await jobs.list_results(job_id, profile, db_session)


@router.post('/complete/{job_id}')
async def set_complete(
        job_id: str,
        db_session: AsyncSession = Depends(get_db_session)):
    """Mark a job as complete"""
    return await jobs.complete_job(job_id, db_session)


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
                interactive=job_def.interactive
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


@router.get('/by_asset/{asset_id}/versions/{major}/{minor}/{patch}')
async def jobs_by_asset_version(
        asset_id: str,
        major: int,
        minor: int,
        patch: int,
        db_session: AsyncSession = Depends(get_db_session)) -> list[ExtendedJobResultResponse]:
    """Get all jobs for certain version of asset"""
    asset_seq = asset_id_to_seq(asset_id)
    asset_version = await assets.get_version(db_session, asset_seq, major, minor, patch)
    if asset_version is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, f"asset {asset_id}-{major}.{minor}.{patch} not found")
    return await jobs.resolve_jobs_from_job_definitions(db_session, asset_version)
