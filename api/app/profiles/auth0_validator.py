"""Implements the bridging logic to the auth0 backend system as a swappable API"""
import logging

import httpx
import jwt

from config import app_config

log = logging.getLogger(__name__)


class Auth0ValidatorFake:
    pass


class Auth0Validator:
    async def validate(self, token: str):
        user_info_url = f'https://{app_config().auth0_domain}/userinfo'
        authorization_header = {
            'Authorization': f'Bearer {token}'
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(user_info_url, headers=authorization_header)
            log.info(response.status_code)

        header = jwt.get_unverified_header(token)

        kid = header['kid']
        jwks_url = f'https://{app_config().auth0_domain}/.well-known/jwks.json'
