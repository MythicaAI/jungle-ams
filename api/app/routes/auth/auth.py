from http import HTTPStatus
from urllib.parse import quote_plus, urlencode

from fastapi import APIRouter, Depends, Response, Security
from fastapi.security import HTTPBearer
from fastapi_auth0 import Auth0, Auth0User

from auth.auth0_token_verifier import Auth0TokenVerifier
from config import app_config

auth = Auth0(
    domain=app_config().auth0_domain,
    api_audience=app_config().auth0_audience,
    scopes={'read:blabla': ''})

verifier = Auth0TokenVerifier()

router = APIRouter(
    prefix="/auth",
    tags=["auth"])


# oauth = OAuth(app)
#
# oauth.register(
#     "auth0",
#     client_id=app_config().auth0_client_id,
#     client_secret=app_config().auth0_client_secret,
#     client_kwargs={
#         "scope": "openid profile email",
#     },
#     server_metadata_url=f'https://{app_config().auth0_domain}/.well-known/openid-configuration',
# )


@router.get('/login')
async def login():
    # return oauth.auth0.authorize_redirect(
    #     redirect_uri=router.url_path_for("callback", _external=True)
    # )
    pass


@router.get('/logout')
async def logout(response: Response):
    # session.clear()
    response.status_code = HTTPStatus.TEMPORARY_REDIRECT
    response.headers['location'] = ("https://"
                                    + app_config.auth0_domain
                                    + "/v2/logout?"
                                    + urlencode(
                {
                    "returnTo": router.url_path_for("/", _external=True),
                    "client_id": app_config().auth0_client_id,
                },
                quote_via=quote_plus,
            )
                                    )


@router.get('/back-channel-logout')
async def back_channeL_logout(response: Response):
    response.status_code = HTTPStatus.OK


@router.get('/callback')
async def callback(response: Response):
    # token = oauth.auth0.authorize_access_token()
    # # session["user"] = token
    # response.headers['location'] = "/"
    # from http import HTTPStatus
    # response.status_code = HTTPStatus.TEMPORARY_REDIRECT
    pass


# @router.get('/private')
# async def private(auth_result: str = Security(auth.verify)):
#     return {"message": "success", "auth_result": str(auth_result)}


@router.get('/private-2', dependencies=[Depends(auth.implicit_scheme)])
def private_2(user: Auth0User = Security(auth.get_user, scopes=['read:blabla'])):
    return {"message": f"{user}"}


token_auth_scheme = HTTPBearer()


@router.get('/private-3')
def private_3(auth_result=Security(verifier.verify)):
    return {"message": f"{auth_result}"}
