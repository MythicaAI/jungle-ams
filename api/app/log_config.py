
import logging
from typing import Tuple

from flask import has_request_context, request
from flask.logging import default_handler


class RequestFormatter(logging.Formatter):
    """
    This formatter extracts the request information and adds
    it to the log format
    """
    def format(self, record):
        if has_request_context():
            record.request_id = request.environ.get('REQUEST_ID', '')
            record.url = request.url
            record.remote_addr = request.remote_addr
        else:
            record.url = None
            record.remote_addr = None

        return super().format(record)


def configure():
    # Request formatting with IP and URL embedded
    fmt = '[%(asctime)s] [%(levelname)s] [%(remote_addr)s] [%(url)s] [%(request_id)s] [%(filename)s(%(lineno)d)]: %(message)s'
    formatter = RequestFormatter(fmt)
    default_handler.setFormatter(formatter)
    logging.getLogger().setLevel(logging.DEBUG)