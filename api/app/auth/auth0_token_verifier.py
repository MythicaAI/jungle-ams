from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status

from config import app_config


class UnauthorizedException(HTTPException):
    """Exception raised for unauthorized requests."""

    def __init__(self, detail: str, **kwargs):
        """Returns HTTP 403"""
        super().__init__(status.HTTP_403_FORBIDDEN, detail=detail)


class UnauthenticatedException(HTTPException):
    """Exception raised for unauthenticated API requests"""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Requires authentication")


class Auth0TokenVerifier(object):
    def __init__(self):
        jwks_url = f'https://{app_config().auth0_domain}/.well-known/jwks.json'
        self.jwks_client = jwt.PyJWKClient(jwks_url)

    async def verify(self,
                     security_scopes: SecurityScopes,
                     token: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer())):
        if token is None:
            raise UnauthenticatedException

        # This gets the 'kid' from the passed token
        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(
                token.credentials
            ).key
        except jwt.exceptions.PyJWKClientError as error:
            raise UnauthorizedException(str(error))
        except jwt.exceptions.DecodeError as error:
            raise UnauthorizedException(str(error))
