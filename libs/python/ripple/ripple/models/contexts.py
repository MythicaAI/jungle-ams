from enum import Enum
class FilePurpose(Enum):
    API_UPLOAD = 'api_upload'
    AUTOMATION = 'automation'
    SYSTEM_GENERATED = 'system_generated'
    UNDEFINED = None