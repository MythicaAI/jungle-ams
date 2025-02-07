import logging
import sys
from opentelemetry._logs import set_logger_provider
from opentelemetry.context import get_current
from opentelemetry.propagate import inject
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import ConsoleLogExporter, SimpleLogRecordProcessor

from config import app_config
from ripple.config import (
    CustomJSONFormatter,
    configure_telemetry,
    get_telemetry_resource,
)


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

        logger = logging.getLogger()
        logging.basicConfig(level=logging.INFO, format="%(message)s")
        resource = get_telemetry_resource()
        logger_provider = LoggerProvider(resource=resource)
        set_logger_provider(logger_provider)

        logger_provider.add_log_record_processor(
            SimpleLogRecordProcessor(ConsoleLogExporter())
        )

        otel_log_handler = LoggingHandler(level=logging.INFO)
        logger.addHandler(otel_log_handler)

        otel_log_handler.setFormatter(CustomJSONFormatter())


def get_telemetry_headers() -> dict:
    trace_context = {}
    inject(trace_context, get_current())
    return trace_context
