from pydantic import BaseModel
from typing import Dict, List

class HealthResponse(BaseModel):
    status: str
    metadata: Dict

class WorkerListResponse(BaseModel):
    workers: List[Dict]