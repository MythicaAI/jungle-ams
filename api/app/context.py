"""Definitions for request context caching for data that flows from
an HTTP request through the application request path"""
from datetime import timezone, datetime
from pydantic import BaseModel, Field

from ripple.models.contexts import FilePurpose
from ripple.models.sessions import SessionProfile


class UploadContext(BaseModel):
    """The context is built up during the request and used to satisfy
    downstream dependencies"""

    profile: SessionProfile  # web session initiating the request
    owner_id: str  # owner of file, may be impersonated

    file_id: str | None = None
    event_id: str | None = None
    filename: str = ''
    local_filepath: str = ''
    timestamp: datetime = datetime.now(timezone.utc)
    file_size: int = 0
    content_hash: str = ''
    extension: str = ''
    locators: list = Field(default_factory=list)
    purpose: FilePurpose = FilePurpose.UNDEFINED
    bucket_name: str = ''
    object_name: str = ''

    def add_object_locator(self, backend, bucket_name, object_name):
        """Add a backend storage locator reference"""
        self.locators.append(f"{backend}://{bucket_name}:{object_name}")
