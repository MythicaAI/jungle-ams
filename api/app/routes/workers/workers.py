import logging
from http import HTTPStatus
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import insert
from sqlmodel.ext.asyncio.session import AsyncSession

from db.connection import get_db_session
from db.schema.jobs import Worker
from repos import jobs
from ripple.automation.adapters import NatsAdapter
from routes.workers.models import WorkerAdvertisement

log = logging.getLogger(__name__)


class HostRef(BaseModel):
    host_key: str


class WorkerRef(BaseModel):
    controller_id: uuid4


class WorkerCache:
    def __init__(self):
        self.workers = {}
        self.last_snapshot = []

    def add(self, worker: WorkerRef):
        self.workers[worker.controller_id] = worker

    def remove(self, worker: WorkerRef):
        del self.workers[worker.controller_id]

    def get(self, controller_id: uuid4) -> WorkerRef:
        return self.workers[controller_id]

    def handle_advertise(self, req: WorkerAdvertisement):
        log.info("advertisement: %s", req.model_dump())

    def available(self) -> [HostRef]:
        return self.last_snapshot


router = APIRouter(prefix="/workers", tags=["workers"])


@router.post("/advertise")
async def advertise(
        req: WorkerAdvertisement,
        db_session: AsyncSession = Depends(get_db_session)) -> WorkerAdvertisement:
    stmt = insert(Worker).values(**req.model_dump())
    r = await db_session.exec(stmt)
    if r.rowcount != 1:
        raise HTTPException(HTTPStatus.INTERNAL_SERVER_ERROR, "failed to add worker")
    nats = NatsAdapter()
    req.worker_id = r.inserted_primary_key[0]
    await nats.post_to("workers", req.controller_id, req.model_dump())
    return req


@router.get("/connect/{job_id}")
async def allocate(job_id: str, db_session: AsyncSession = Depends(get_db_session)):
    """
    Called from the proxy to allocate a worker to a job
    """
    # get all workers for this job

    results = jobs.list_results(job_id, db_session)

    # validate that allocation results below threshold
    for results in results:
        raise HTTPException(HTTPStatus.SERVICE_UNAVAILABLE)
