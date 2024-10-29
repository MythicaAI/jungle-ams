import json
import logging
from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import (
    OTLPLogExporter,
)
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    ConsoleSpanExporter,
)
from opentelemetry.trace import set_tracer_provider
from config import app_config


class CustomJSONFormatter(logging.Formatter):
    def format(self, record):
        record.msg = json.dumps(
            {
                "message": record.msg,
                "level": record.levelname,
                "time": self.formatTime(record),
                **(record.__dict__ if record.__dict__ else {}),
            }
        )
        return super().format(record)


def configure_logging():
    if app_config().enable_otel:
        # Set up tracing
        tracer_provider = TracerProvider()
        set_tracer_provider(tracer_provider)
        tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

        # Set up logging
        logger_provider = LoggerProvider()
        set_logger_provider(logger_provider)

        exporter = OTLPLogExporter(endpoint=app_config().otel_endpoint, insecure=True)
        logger_provider.add_log_record_processor(BatchLogRecordProcessor(exporter))

        # Configure logging with OpenTelemetry handler and custom JSON formatter
        logging.basicConfig(level=logging.INFO)
        otel_log_handler = LoggingHandler(level=logging.INFO)
        logging.getLogger().addHandler(otel_log_handler)

        # Set custom formatter for OpenTelemetry logs
        for handler in logging.getLogger().handlers:
            handler.setFormatter(CustomJSONFormatter())
    else:
        # Default logging configuration without OpenTelemetry
        logging.basicConfig(level=logging.INFO, format="%(message)s")
        logger = logging.getLogger()
        for handler in logger.handlers:
            handler.setFormatter(CustomJSONFormatter())
