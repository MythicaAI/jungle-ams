"""Definitions for request context caching for data that flows from
an HTTP request through the application request path"""
from datetime import timezone, datetime
from ripple.models.contexts import FilePurpose

class RequestContext:
    """The context is built up during the request and used to satisfy
    downstream dependencies"""

    def __init__(self):
        self.file_id: str | None = None
        self.event_id: str | None = None
        self.filename: str = ''
        self.local_filepath: str = ''
        self.profile_id: str = ''
        self.timestamp: datetime = datetime.now(timezone.utc)
        self.file_size: int = 0
        self.content_hash: str = ''
        self.extension: str = ''
        self.locators: list = []
        self.purpose: FilePurpose = FilePurpose.UNDEFINED

    def add_object_locator(self, backend, bucket_name, object_name):
        """Add a backend storage locator reference"""
        self.locators.append(f"{backend}://{bucket_name}:{object_name}")
