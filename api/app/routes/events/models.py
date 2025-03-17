from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from ripple.automation.models import EventAutomationResponse


class EventUpdateResponse(BaseModel):
    """
    Response schema for event update
    """

    event_id: str
    event_type: str
    job_result_data: Optional[dict] = None
    completed: Optional[datetime] = None
    job_data: Optional[dict] = None
    owner_id: Optional[str] = None
    created_in: Optional[str] = None
    affinity: Optional[str] = None
    job_result_data: Optional[EventAutomationResponse] = None
