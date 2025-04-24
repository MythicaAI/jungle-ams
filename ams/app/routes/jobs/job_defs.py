from http import HTTPStatus
from uuid import uuid4

from fastapi import Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

import repos.assets as assets
from cryptid.cryptid import (
    asset_id_to_seq,
    file_id_to_seq,
    file_seq_to_id,
    job_def_id_to_seq,
    job_def_seq_to_id,
    profile_seq_to_id,
)
from db.connection import get_db_session
from db.schema.assets import AssetVersionEntryPoint
from db.schema.jobs import JobDefinition
from repos.assets import AssetVersionResult
from ripple.automation.adapters import NatsAdapter
from ripple.automation.models import AutomationRequest
from ripple.automation.worker import process_guid
from ripple.models.assets import AssetVersionEntryPointReference
from ripple.models.params import FileParameter, ParameterSet
from ripple.models.sessions import SessionProfile
from routes.authorization import maybe_session_profile, session_profile
from routes.jobs.router import router
from telemetry_config import get_telemetry_headers
from .models import (
    JobDefinitionModel,
    JobDefinitionRequest,
    JobDefinitionResponse,
    JobDefinitionTemplateRequest)

__force_import__ = "force import to ensure routes are registered"


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
            interactive=req_data.interactive,
            src_file_seq=file_id_to_seq(req_data.source.file_id),
            entry_point=req_data.source.entry_point,
            job_def_seq=job_def_seq
        )
        await db_session.merge(asset_version_entry_point)
        await db_session.commit()

    return JobDefinitionResponse(
        job_def_id=job_def_seq_to_id(job_def_seq),
        interactive=job_def.interactive)


@router.post('/definitions/{job_def_id}', status_code=HTTPStatus.CREATED)
async def define_new_from_template(
        job_def_id: str,
        new_data: JobDefinitionTemplateRequest,
        profile: SessionProfile = Depends(maybe_session_profile),
        db_session: AsyncSession = Depends(get_db_session),
) -> JobDefinitionResponse:
    """Create a new job definition from a template of JobDefinition by job_def_id"""
    # Get old JobDefinition
    old_job_def = (
        await db_session.exec(
            select(JobDefinition).where(
                JobDefinition.job_def_seq == job_def_id_to_seq(job_def_id)
            )
        )
    ).one_or_none()
    if old_job_def is None:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="job_def_id not found")
    old_model = JobDefinitionModel(
        job_def_id=job_def_seq_to_id(old_job_def.job_def_seq),
        owner_id=(
            profile_seq_to_id(old_job_def.owner_seq)
            if old_job_def.owner_seq is not None
            else None
        ),
        **old_job_def.model_dump(),
    )

    # Fill the new JobDefinition with the template JobDefinition data
    new_data.job_type = new_data.job_type or old_model.job_type
    new_data.name = new_data.name or old_model.name
    new_data.description = new_data.description or old_model.description
    new_data.source = new_data.source or old_model.source
    if new_data.params_schema:
        if new_data.params_schema.params_v2 is None:
            new_data.params_schema.params_v2 = old_model.params_schema.params_v2
    else:
        new_data.params_schema = old_model.params_schema

    new_model = new_data.model_dump()
    if profile:
        new_model["owner_seq"] = profile.profile_seq
    job_def = JobDefinition(**new_model)
    db_session.add(job_def)
    await db_session.commit()
    await db_session.refresh(job_def)
    job_def_seq = job_def.job_def_seq

    # Create the asset version link
    if new_data.source:
        asset_version_entry_point = AssetVersionEntryPoint(
            asset_seq=asset_id_to_seq(new_data.source.asset_id),
            major=new_data.source.major,
            minor=new_data.source.minor,
            patch=new_data.source.patch,
            src_file_seq=file_id_to_seq(new_data.source.file_id),
            entry_point=new_data.source.entry_point,
            job_def_seq=job_def_seq,
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
    latest_version = await assets.latest_version(db_session, asset_seq)
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
    asset_version = await assets.get_version(db_session, asset_seq, major, minor, patch)
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
    if NatsAdapter.is_disabled(f"def_from_file: {file_id}"):
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


@router.get('/definitions/by_asset/{asset_id}')
async def by_latest_asset(
        asset_id: str,
        db_session: AsyncSession = Depends(get_db_session)) -> list[JobDefinitionModel]:
    asset_seq = asset_id_to_seq(asset_id)
    latest_version = await assets.latest_version(db_session, asset_seq)
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
    asset_version = await assets.get_version(db_session, asset_seq, major, minor, patch)
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
