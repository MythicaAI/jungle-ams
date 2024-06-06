import logging
import os
import sys

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

import routes.upload.upload
import routes.editor.editor
import routes.profiles.profiles
import routes.assets.assets
import routes.files.files

import db.connection as db_connection
import log_config
from config import app_config

# This must run before the app is created to override the default
# default logging configuration
log_config.configure()

log = logging.getLogger(__name__)

app = FastAPI()

origins = [
    "https://api.mythica.ai",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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


@app.get("/")
def root():
    log.info('Root endpoint hit')
    return "Alive and well"


def main():
    # setup logging and validate dependencies before serving clients
    db_connection.validate()
    cfg = app_config()
    print('database validated')
    print(f"temporary upload folder is {cfg.upload_folder}")


if __name__ == '__main__':
    main()

