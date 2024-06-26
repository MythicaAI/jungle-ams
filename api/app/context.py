"""Definitions for request context caching for data that flows from
an HTTP request through the application request path"""
from datetime import timezone, datetime
from uuid import UUID


class RequestContext:
    """The context is built up during the request and used to satisfy
    downstream dependencies"""

    def __init__(self):
        self.file_id: UUID | None = None
        self.event_id: UUID | None = None
        self.filename: str = ''
        self.local_filepath: str = ''
        self.profile_id: UUID = UUID(int=0, version=4)
        self.timestamp: datetime = datetime.now(timezone.utc)
        self.file_size: int = 0
        self.content_hash: str = ''
        self.extension: str = ''
        self.locators: list = []

    def add_object_locator(self, backend, bucket_name, object_name):
        """Add a backend storage locator reference"""
        self.locators.append(f"{backend}://{bucket_name}:{object_name}")
