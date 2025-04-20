import logging
import sys

from config import app_config
from ripple.config import configure_telemetry, update_headers_from_context


def configure_logging():
    # Skip if pytest is running
    if "pytest" in sys.argv[0] or "pytest" in sys.modules:
        print("logging disabled under pytest")
        return

    if app_config().telemetry_enable:
        configure_telemetry(
            app_config().telemetry_endpoint,
            app_config().telemetry_insecure,
            [('signoz-access-token', app_config().telemetry_token)],
        )
    else:
        logging.basicConfig(level=logging.INFO, format="%(message)s")


def get_telemetry_headers() -> dict:
    return update_headers_from_context()
