import importlib
import sys
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor as OpenTelemetryInstrumentor
from prometheus_fastapi_instrumentator import Instrumentator as PrometheusInstrumentor

from cache.connection import cache_connection_lifespan, get_redis
from config import app_config
from db.connection import db_connection_lifespan, get_db_session
from exception_handlers import register_exceptions
from middlewares.exception_middleware import ExceptionLoggingMiddleware
from middlewares.proxied_headers_middleware import ProxiedHeadersMiddleware
from ripple_sources.register import register_streaming_sources, unregister_streaming_sources


@asynccontextmanager
async def server_lifespan(app: FastAPI):
    """
    Create a lifespan that binds application resources to the startup and shutdown
    of the application
    """
    register_streaming_sources()
    register_exceptions(app)

    async with db_connection_lifespan() as db_conn, cache_connection_lifespan() as cache_conn:
        yield {
            'db': db_conn,
            'cache': cache_conn,
        }

    unregister_streaming_sources()


def create_app(use_prom=False, intercept_exceptions=False):
    """
    Create the FastAPI application - used from main executable and test contexts
    """

    def custom_generate_unique_id(route: APIRoute):
        """Generate a simplified operation ID for client generation"""
        return f"{route.tags[0]}-{route.name}"

    app = FastAPI(
        openapi_version='3.1.0',
        generate_unique_id_function=custom_generate_unique_id,
        servers=[
            {'url': 'https://api.mythica.ai/', 'description': 'Production environment'},
            {'url': 'http://localhost:8080', 'description': 'Local environment'}],
        root_path='/v1',
        lifespan=server_lifespan)

    # Add the prometheus metrics endpoint /metrics for scraping
    if use_prom:
        PrometheusInstrumentor().instrument(app).expose(
            app,
            include_in_schema=False,
            tags=["internal", "metrics"])

    if app_config().telemetry_enable:
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

    if intercept_exceptions:
        if not "pytest" in sys.argv[0] or not "pytest" in sys.modules:
            app.add_middleware(ExceptionLoggingMiddleware)

    bind_routes(app)
    return app


def bind_routes(app):
    """Bind all the FastAPI routes, this prevents writing boilerplate
    and pylint errors"""
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

    # always bind the default health endpoint
    @app.get("/", include_in_schema=False, tags=["internal", "health"])
    async def health(db_session=Depends(get_db_session), redis=Depends(get_redis)):
        """Health check"""
        cache_health_status = await redis.info()
        return {'healthy': True,
                'tracing': trace.get_current_span().is_recording(),
                'db': db_session.is_active,
                'cache': 'redis_version' in cache_health_status}
