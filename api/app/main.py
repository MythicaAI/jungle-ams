"""Main entrypoint for FastAPI app creation"""

import logging

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

import db.connection as db_connection
import log_config
import routes.assets.assets
import routes.download.download
import routes.editor.editor
import routes.files.files
import routes.orgs.orgs
import routes.topos.topos
import routes.upload.upload
import routes.validate.validate
from config import app_config
from routes.type_adapters import register_adapters

# This must run before the app is created to override the default
# default logging configuration
log_config.configure()

log = logging.getLogger(__name__)

app = FastAPI(
    openapi_version='3.1.0',
    servers=[
        {'url': 'https://api.mythica.ai/', 'description': 'Production environment'},
        {'url': 'http://localhost:8080', 'description': 'Local environment'}],
    root_path='/v1')

Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api_prefix = "/v1"
app.include_router(routes.upload.upload.router, prefix=api_prefix)
app.include_router(routes.editor.editor.router, prefix=api_prefix)
app.include_router(routes.profiles.profiles.router, prefix=api_prefix)
app.include_router(routes.assets.assets.router, prefix=api_prefix)
app.include_router(routes.files.files.router, prefix=api_prefix)
app.include_router(routes.orgs.orgs.router, prefix=api_prefix)
app.include_router(routes.topos.topos.router, prefix=api_prefix)
app.include_router(routes.validate.validate.validate_email_router, prefix=api_prefix)
app.include_router(routes.download.download.router, prefix=api_prefix)

register_adapters()


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
    uvicorn.run("main:app",
                host=cfg.http_listen_addr,
                port=cfg.http_listen_port,
                reload=True)


if __name__ == '__main__':
    main()
