from datetime import timezone, datetime

import flask


class RequestContext:
    def __init__(self, request: flask.Request):
        self.filename = ''
        self.local_filepath = ''
        self.user = 'unknown'
        self.timestamp = datetime.now(timezone.utc)
        self.file_size = 0
        self.bucket_name = ''
        self.object_name = ''
        self.content_hash = ''
        self.extension = ''
