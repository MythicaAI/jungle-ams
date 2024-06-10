import json
import secrets
import string
import logging


api_base = '/api/v1'


log = logging.getLogger(__name__)


def get_random_string(length, digits=False):
    characters = string.ascii_letters
    if digits:
        characters += string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def assert_status_code(response, expected_status_code):
    if response.status_code == expected_status_code:
        return
    obj = response.json()
    if type(obj) is dict:
        detail = response.json().get('detail') or ''
        message = f"details: {json.dumps(detail)}"
    else:
        message = f"obj: {json.dumps(obj)}"
    log.error(message)
    assert response.status_code == expected_status_code, message
