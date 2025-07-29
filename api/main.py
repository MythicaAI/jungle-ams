"""Main entrypoint for FastAPI app creation"""
import logging

import uvicorn

from config import app_config
from create_app import create_app
from telemetry_config import configure_logging

# This must run before the app is created to override the default
#  logging configuration
configure_logging()

log = logging.getLogger(__name__)
app = create_app(use_prom=True, intercept_exceptions=True)


def main():
    """Main entry point setup core systems and validate dependencies before serving clients"""
    cfg = app_config()
    print(f"temporary upload folder is {cfg.upload_folder}")
    uvicorn.run("main:app",
                host=cfg.http_listen_addr,
                port=cfg.http_listen_port,
                reload=True)


if __name__ == "__main__":
    main()
