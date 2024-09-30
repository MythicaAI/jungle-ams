"""Implements the bridging logic to the auth0 backend system as a swappable API"""
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from http import HTTPStatus
import httpx
import jwt
from pydantic import BaseModel

from config import app_config

log = logging.getLogger(__name__)


class ValidTokenPayload(BaseModel):
    """Verified token payload"""
    sub: str
    scope: str
    iat: int
    exp: int


class UserProfile(BaseModel):
    """Response from userinfo query with token"""
    email: str
    email_verified: bool
    nickname: str
    name: str


class AuthTokenValidator(ABC):
    """Base type for auth token validation"""

    @abstractmethod
    async def validate(self, token: str) -> ValidTokenPayload:
        """Validation interface definition"""

    @abstractmethod
    async def query_user_profile(self, token: str) -> UserProfile:
        """Query the user profile store using the provided token"""


class Auth0ValidatorFake(AuthTokenValidator):
    """Fake validator for auth0"""

    def __init__(self, **kwargs):
        super().__init__()
        default_token = {
            "sub": "googleoth|1096710971",
            "iat": datetime.now(timezone.utc).second,
            "exp": (datetime.now(timezone.utc) + timedelta(minutes=10)).second,
            "scope": "openid profile email"
        }
        default_profile = {
            "email": "test@test.com",
            "email_verified": True,
            "name": "Test User",
            "nickname": "test"
        }
        for k, v in kwargs.items():
            if k in default_token:
                default_token[k] = v
            elif k in default_profile:
                default_profile[k] = v
        self.fake_token = ValidTokenPayload(**default_token)
        self.fake_profile = UserProfile(**default_profile)

    async def validate(self, _: str) -> ValidTokenPayload:
        """Return a faked validation response"""
        return self.fake_token

    async def query_user_profile(self, token: str) -> UserProfile:
        """Return a faked user profile"""
        return self.fake_profile


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

    async def validate(self, token: str) -> ValidTokenPayload:
        """Validate the auth0 application using it's provided token against the token
        issuer. There is a API that will provide the user metadata to get the profile"""
        # decode the payload with the signing key to verify
        aud = app_config().auth0_audience
        try:
            payload = jwt.decode(
                token,
                (await self.get_signing_key(token)).key,
                algorithms=self.alg,
                audience=aud,
                issuer=f"https://{app_config().auth0_domain}/")
        except jwt.InvalidAudienceError as e:
            raise HTTPException(HTTPStatus.BAD_REQUEST, f"invalid audience: {aud}") from e

        return ValidTokenPayload(
            sub=payload['sub'],
            scope=payload['scope'],
            iat=payload['iat'],
            exp=payload['exp'])

    async def query_user_profile(self, token) -> UserProfile:
        user_info_url = f'https://{app_config().auth0_domain}/userinfo'
        authorization_header = {
            'Authorization': f'Bearer {token}'
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(user_info_url, headers=authorization_header)
            log.debug("auth0 userinfo response: %s", response.status_code)
            return UserProfile(**response.json())
