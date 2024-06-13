"""Main entrypoint for FastAPI app creation"""
import json
import logging
from os import environ as env
from urllib.parse import quote_plus, urlencode

from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from prometheus_fastapi_instrumentator import Instrumentator

import routes.upload.upload
import routes.editor.editor
import routes.profiles.profiles
import routes.assets.assets
import routes.files.files
import routes.orgs.orgs
import routes.topos.topos

import db.connection as db_connection
import log_config
from config import app_config


# This must run before the app is created to override the default
# default logging configuration
log_config.configure()
log = logging.getLogger(__name__)
app = FastAPI()
Instrumentator().instrument(app).expose(app)

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

app.secret_key = env.get("APP_SECRET_KEY")
templates = Jinja2Templates(directory="templates")

oauth = OAuth(app)
oauth.register(
    "auth0",
    client_id=env.get("AUTH0_CLIENT_ID"),
    client_secret=env.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=f'https://{env.get("AUTH0_DOMAIN")}/.well-known/openid-configuration'
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api_prefix = "/api/v1"
app.include_router(routes.upload.upload.router, prefix=api_prefix)
app.include_router(routes.editor.editor.router, prefix=api_prefix)
app.include_router(routes.profiles.profiles.router, prefix=api_prefix)
app.include_router(routes.assets.assets.router, prefix=api_prefix)
app.include_router(routes.files.files.router, prefix=api_prefix)
app.include_router(routes.orgs.orgs.router, prefix=api_prefix)
app.include_router(routes.topos.topos.router, prefix=api_prefix)


@app.get("/")
def root():
    log.info('Root endpoint hit')
    return "Alive and well"


SESSION_TEST = {}
@app.get("/home")
def home(request:Request):
    log.info("Auth happening")
    return templates.TemplateResponse(request=request, name="home_page.html", context={"session": SESSION_TEST})


@app.get("/login")
def login():
    return oauth.auth0.authorize_redirect(
        redirect_uri=app.url_path_for("callback", _external=True)
    )


@app.get("/callback")
@app.post("/callback")
def callback():
    token = oauth.auth0.authorize_access_token()
    SESSION_TEST["user"] = token
    return RedirectResponse(url=app.url_path_for("home"))


@app.route("/logout")
def logout():
    SESSION_TEST = {}
    return RedirectResponse(
        "https://" + env.get("AUTH0_DOMAIN")
        + "/v2/logout?"
        + urlencode(
            {
                "returnTo": app.url_path_for("home", _external=True),
                "client_id": env.get("AUTH0_CLIENT_ID"),
            },
            quote_via=quote_plus,
        )
    )


def main():
    # setup logging and validate dependencies before serving clients
    db_connection.validate()
    cfg = app_config()
    print('database validated')
    print(f"temporary upload folder is {cfg.upload_folder}")


if __name__ == '__main__':
    main()
