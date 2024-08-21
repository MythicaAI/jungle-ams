"""Main entrypoint for FastAPI app creation"""

import importlib
import logging

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

import db.connection as db_connection
import log_config
from config import app_config
from routes.type_adapters import register_adapters

# This must run before the app is created to override the default
#  logging configuration
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

route_names = [
    'auth',
    'upload',
    'download',
    'profiles',
    'files',
    'assets',
    'orgs',
    'topos',
    'sessions',
    'validate']

for name in route_names:
    module = importlib.import_module(f'routes.{name}.{name}')
    router = getattr(module, 'router')
    app.include_router(router)
    print(f'registered router {name} from path: {module.__file__}')

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
