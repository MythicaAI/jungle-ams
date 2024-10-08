import importlib
import logging
import os
import uvicorn
from fastapi import FastAPI


# Set up logging configuration
logging.getLogger().setLevel(logging.DEBUG)
log = logging.getLogger(__name__)

# Create FastAPI app with specific configurations
app = FastAPI()


# Function to dynamically discover and register routers
def load_routers():
    module_name = 'routes'  # Strip .py extension
    try:
        # Dynamically import the module from the 'automation' directory
        module = importlib.import_module(module_name)
        # Get the 'router' from the module and include it in the FastAPI app
        routes = getattr(module, 'routes')
        for route in routes:
            app.add_api_route(route.path, route.provider, route.method)
            log.info(f'Registered routes')
    except Exception as e:
        log.error(f'Failed to register routes: {e}')
        
# Load all routers from the routes directory
load_routers()

@app.get("/")
def root():
    log.info('Root endpoint hit')
    return "Alive and well"


def main():
    # Setup logging and validate dependencies before serving clients
    uvicorn.run("main:app",
                host='127.0.0.1',
                port='5555',
                reload=True)

if __name__ == '__main__':
    main()