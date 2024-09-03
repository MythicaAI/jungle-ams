"""Implements the bridging logic to the auth0 backend system as a swappable API"""
import logging
from abc import ABC, abstractmethod

import httpx
import jwt
from pydantic import BaseModel

from config import app_config

log = logging.getLogger(__name__)


class TokenValidatorResponse(BaseModel):
    sub: str
    email: str
    email_verified: bool
    nickname: str
    name: str


class AuthTokenValidator(ABC):
    """Base type for auth token validation"""

    @abstractmethod
    async def validate(self, token: str) -> TokenValidatorResponse:
        """Validation interface definition"""
        pass


class Auth0ValidatorFake(AuthTokenValidator):
    """Fake validator for auth0"""

    def __init__(self, **kwargs):
        super().__init__()
        default_values = {
            "sub": "googleoth|1096710971",
            "email": "test@test.com",
            "email_verified": True,
            "name": "Test User",
            "nickname": "test"
        }
        kwargs.update(default_values)
        self.response = TokenValidatorResponse(**kwargs)

    async def validate(self, _: str) -> TokenValidatorResponse:
        """Return a faked validation response"""
        return self.response


class Auth0Validator(AuthTokenValidator):
    """Validator against the auth0 userinfo endpoint"""

    def __init__(self):
        super().__init__()
        self.signing_key = None
        self.alg = []

    async def get_signing_key(self, token: str) -> jwt.PyJWK:
        """Given the KID of the token and the auto domain, get the signing key for JWT tokens
        issued by that domain"""
        if self.signing_key is not None:
            return self.signing_key

        # get the initial JWT header without verification to extract the key ID
        header = jwt.get_unverified_header(token)

        # get the jwks key definitions and extract the signing key
        jwks_url = f'https://{app_config().auth0_domain}/.well-known/jwks.json'
        jwks_client = jwt.PyJWKClient(jwks_url)
        kid = header['kid']
        self.signing_key = jwks_client.get_signing_key(kid)
        self.alg = [header['alg']]
        return self.signing_key

    async def validate(self, token: str) -> TokenValidatorResponse:
        """Validate the auth0 application using it's provided token against the token
        issuer. There is a API that will provide the user metadata to get the profile"""
        user_info_url = f'https://{app_config().auth0_domain}/userinfo'
        authorization_header = {
            'Authorization': f'Bearer {token}'
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(user_info_url, headers=authorization_header)
            log.debug("auth0 userinfo response: %s", response.status_code)

        # decode the payload with the signing key to verify
        payload = jwt.decode(
            token,
            (await self.get_signing_key(token)).key,
            algorithms=self.alg,
            audience=app_config().auth0_audience,
            issuer=f"https://{app_config().auth0_domain}/")
        log.debug("auth0 userinfo payload: %s", payload)

        return TokenValidatorResponse(
            sub=payload['sub'],
            email=payload['email'],
            email_verified=payload['email_verified'])
