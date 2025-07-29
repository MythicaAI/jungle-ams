from enum import Enum


class FilePurpose(Enum):
    """Shared definition for file usage"""

    API_UPLOAD = "api_upload"
    AUTOMATION = "automation"
    SYSTEM_GENERATED = "system_generated"
    UNDEFINED = "undefined"
