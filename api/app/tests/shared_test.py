import secrets
import string

api_base = '/api/v1'


def get_random_string(length, digits=False):
    characters = string.ascii_letters
    if digits:
        characters += string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def assert_status_code(response, expected_status_code):
    detail = response.json().get('detail') or ''
    assert response.status_code == expected_status_code, detail
