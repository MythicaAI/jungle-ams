from datetime import timezone, datetime

import flask


class RequestContext:
    def __init__(self, request: flask.Request):
        self.filename = ''
        self.local_filepath = ''
        self.user = 'unknown'
        self.timestamp = datetime.now(timezone.utc)
        self.file_size = 0
        self.content_hash = ''
        self.extension = ''
        self.locators = list()

    def add_object_locator(self, backend, bucket_name, object_name):
        self.locators.append(f"{backend}://{bucket_name}:{object_name}")
