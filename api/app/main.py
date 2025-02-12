"""Main entrypoint for FastAPI app creation"""
import importlib
import logging
import sys
from contextlib import asynccontextmanager

import uvicorn
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor as OpenTelemetryInstrumentor
from prometheus_fastapi_instrumentator import Instrumentator as PrometheusInstrumentor

from cache.connection import cache_connection_lifespan, get_redis
from config import app_config
from db.connection import db_connection_lifespan, get_session
from exceptions import register_exceptions
from middlewares.exception_middleware import ExceptionLoggingMiddleware
from middlewares.proxied_headers_middleware import ProxiedHeadersMiddleware
from ripple_sources.register import register_streaming_sources
from telemetry_config import configure_logging

# This must run before the app is created to override the default
#  logging configuration
configure_logging()

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


def custom_generate_unique_id(route: APIRoute):
    """Generate a simplified operation ID for client generation"""
    return f"{route.tags[0]}-{route.name}"


app = FastAPI()

app = FastAPI(
    openapi_version='3.1.0',
    generate_unique_id_function=custom_generate_unique_id,
    servers=[
        {'url': 'https://api.mythica.ai/', 'description': 'Production environment'},
        {'url': 'http://localhost:8080', 'description': 'Local environment'}],
    root_path='/v1',
    lifespan=server_lifespan)

# Add the prometheus metrics endpoint /metrics for scraping
PrometheusInstrumentor().instrument(app).expose(
    app,
    include_in_schema=False,
    tags=["internal", "metrics"])

# Add the FastAPI instrumentation
OpenTelemetryInstrumentor.instrument_app(app)

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
if not "pytest" in sys.argv[0] or not "pytest" in sys.modules:
    app.add_middleware(ExceptionLoggingMiddleware)

route_names = [
    'upload',
    'download',
    'profiles',
    'files',
    'jobs',
    'automation',
    'assets',
    'asset_groups',
    'orgs',
    'topos',
    'sessions',
    'validate',
    'keys',
    'readers',
    'tags',
]

for name in route_names:
    module = importlib.import_module(f'routes.{name}.{name}')
    router = getattr(module, 'router')
    app.include_router(router)

register_exceptions(app)
register_streaming_sources()


@app.get("/", include_in_schema=False, tags=["internal", "health"])
async def health(db_session=Depends(get_session), redis=Depends(get_redis)):
    """Health check"""
    cache_health_status = await redis.info()
    return {'healthy': True,
            'tracing': trace.get_current_span().is_recording(),
            'db': db_session.is_active,
            'cache': 'redis_version' in cache_health_status}


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
