""""Define the streaming source from the events table"""
from http import HTTPStatus
from typing import Any
from uuid import uuid4

from fastapi import HTTPException
from sqlmodel import select

from cryptid.cryptid import job_result_id_to_seq
from db.connection import get_session
from db.schema.jobs import JobResult
from ripple.funcs import Source
from ripple.models.streaming import Message, StreamItem


def transform_job_results(_):
    """Transform contents of job results table to stream"""
    return [Message(process_id=uuid4(), message="job result")]


def create_job_results_table_source(params: dict[str, Any]) -> Source:
    """Constructor of event table result stream sources"""
    param_page_size = params.get('page_size', 1)
    param_owner_seq = params.get('owner_seq', None)
    param_job_seq = params.get('job_seq', None)
    param_job_result_seq = params.get('job_result_seq', None)

    if param_owner_seq is None:
        raise HTTPException(HTTPStatus.BAD_REQUEST, 'an owner is required for job result table streams')
    if param_job_seq is None:
        raise HTTPException(HTTPStatus.BAD_REQUEST, 'a job is required for job result table streams')

    async def job_results_source(after: str, page_size: int) -> list[StreamItem]:
        """Function that produces event table result streams"""
        page_size = max(param_page_size, page_size)
        after_job_result_seq = job_result_id_to_seq(after) if after else 0
        with get_session() as db_session:
            stmt = select(JobResult).where(JobResult.owner_seq == param_owner_seq)
            if param_job_seq:
                stmt.where(JobResult.job_seq == param_job_seq)
            if param_job_result_seq:
                stmt.where(JobResult.job_result_seq == param_job_result_seq)
            if after:
                stmt.where(JobResult.job_result_seq > after_job_result_seq)

            stmt.limit(page_size)
            return transform_job_results((await db_session.exec(stmt)).all())

    return job_results_source
