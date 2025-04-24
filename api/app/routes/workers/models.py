from typing import Optional

from pydantic import BaseModel


class WorkerAdvertisement(BaseModel):
    controller_id: str
    worker_id: Optional[str] = None
    job_count: int
    job_capacity: int
    ws_client_endpoint: str


class WorkerStatus(BaseModel):
    status: str
