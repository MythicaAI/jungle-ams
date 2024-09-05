"""Main entrypoint for FastAPI app creation"""

import importlib
import logging
import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from config import app_config

# Set up logging configuration
logging.getLogger().setLevel(logging.DEBUG)
log = logging.getLogger(__name__)

# Create FastAPI app with specific configurations
app = FastAPI(
    openapi_version='3.1.0',
    servers=[
        {'url': 'https://api.mythica.ai/', 'description': 'Production environment'},
        {'url': f'http://localhost:5556/', 'description': 'Local environment'}
    ],
    root_path='/v1/genai'
)

# Instrument the app with Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to dynamically discover and register routers
def load_routers():
    routes_dir = os.path.join(os.path.dirname(__file__), 'routes')
    for filename in os.listdir(routes_dir):
        if filename.endswith('.py') and filename != '__init__.py':
            module_name = filename[:-3]  # Strip .py extension
            log.info(f'Found module {module_name}')
            try:
                module = importlib.import_module(f'routes.{module_name}') 
                router = getattr(module, 'router')
                app.include_router(router)
                log.info(f'Registered router {module_name} from path: {module.__file__}')
            except Exception as e:
                log.error(f'Failed to register router {module_name}: {e}')

# Load all routers from the routes directory
load_routers()

@app.get("/")
def root():
    log.info('Root endpoint hit')
    return "Alive and well"

def initialize():
    """Empty function to force routes to preload and cache checkpoints in the image."""
    try:
        log.info("Initialization tasks completed successfully.")
    except Exception as e:
        log.error(f"Initialization failed: {e}")
        sys.exit(1)
    sys.exit(0)
    
def main():
    # Setup logging and validate dependencies before serving clients
    cfg = app_config()
    uvicorn.run("main:app",
                host=cfg.http_listen_addr,
                port=cfg.http_listen_port,
                reload=True)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == "initialize":
        initialize()
    else:
        main()