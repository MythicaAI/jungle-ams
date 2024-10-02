"""Main entrypoint for FastAPI app creation"""

import importlib
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

import log_config
from cache.connection import cache_connection_lifespan
from config import app_config
from db.connection import db_connection_lifespan
from exceptions import register_exceptions
from proxied_headers_middleware import ProxiedHeadersMiddleware
from ripple_sources.register import register_streaming_sources
from routes.type_adapters import register_adapters

# This must run before the app is created to override the default
#  logging configuration
log_config.configure()

log = logging.getLogger(__name__)


@asynccontextmanager
async def server_lifespan(_: FastAPI):
    """
    Create a lifespan that binds application resources to the startup and shutdown
    of the application
    """
    async with db_connection_lifespan() as db_conn, cache_connection_lifespan() as cache_conn:
        yield {
            'db': db_conn,
            'cache': cache_conn,
        }


app = FastAPI(
    openapi_version='3.1.0',
    servers=[
        {'url': 'https://api.mythica.ai/', 'description': 'Production environment'},
        {'url': 'http://localhost:8080', 'description': 'Local environment'}],
    root_path='/v1',
    lifespan=server_lifespan)

Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    ProxiedHeadersMiddleware
)

route_names = [
    'upload',
    'download',
    'profiles',
    'files',
    'jobs',
    'assets',
    'orgs',
    'topos',
    'sessions',
    'validate',
    'keys',
    'readers']

for name in route_names:
    module = importlib.import_module(f'routes.{name}.{name}')
    router = getattr(module, 'router')
    app.include_router(router)

register_adapters()
register_exceptions(app)
register_streaming_sources()


@app.get("/")
def root():
    """Health check"""
    return "Alive and well"


def main():
    """Main entry point setup core systems and validate dependencies before serving clients"""
    cfg = app_config()
    print('database validated')
    print(f"temporary upload folder is {cfg.upload_folder}")
    uvicorn.run("main:app",
                host=cfg.http_listen_addr,
                port=cfg.http_listen_port,
                reload=True)


if __name__ == '__main__':
    main()
