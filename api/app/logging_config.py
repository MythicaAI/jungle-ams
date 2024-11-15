import json
import logging
import os
import traceback

from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import (
    OTLPLogExporter,
)
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor, ConsoleLogExporter, SimpleLogRecordProcessor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    ConsoleSpanExporter,
)
from opentelemetry.sdk.resources import Resource
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.trace import set_tracer_provider
from config import app_config


class CustomJSONFormatter(logging.Formatter):
    def format(self, record):
        record_message = record.getMessage()

        # Build the JSON log entry
        log_entry = {
            "message": record_message,
            "level": record.levelname,
            "time": self.formatTime(record),
        }

        if record.exc_info:
            exception_type, exception_value, _ = record.exc_info
            log_entry.update(
                {
                    "exception_type": getattr(exception_type, "__name__", "Unknown"),
                    "exception_value": str(exception_value),
                    "traceback": traceback.format_exc(),
                }
            )

        log_entry.update(
            {
                k: v
                for k, v in record.__dict__.items()
                if k
                not in ['msg', 'args', 'levelname', 'asctime', 'message', 'exc_info']
            }
        )

        json_log_entry = json.dumps(log_entry)

        return json_log_entry


def get_telemetry_resource() -> Resource:
    return Resource.create(
        {
            ResourceAttributes.SERVICE_NAME: "app",
            ResourceAttributes.K8S_NAMESPACE_NAME: os.getenv("NAMESPACE", "unknown"),
            ResourceAttributes.SERVICE_NAMESPACE: os.getenv("NAMESPACE", "unknown"),
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT: os.getenv(
                "NAMESPACE", "unknown"
            ),
        }
    )


def configure_logging():
    logger = logging.getLogger()
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    if app_config().telemetry_enable:
        logger.handlers.clear()

        resource = get_telemetry_resource()

        tracer_provider = TracerProvider(resource=resource)
        set_tracer_provider(tracer_provider)
        tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

        logger_provider = LoggerProvider(resource=resource)
        set_logger_provider(logger_provider)

        exporter = OTLPLogExporter(
            endpoint=app_config().telemetry_endpoint, insecure=True
        )
        logger_provider.add_log_record_processor(BatchLogRecordProcessor(exporter))

        otel_log_handler = LoggingHandler(level=logging.INFO)
        logger.addHandler(otel_log_handler)

        otel_log_handler.setFormatter(CustomJSONFormatter())
    else:
        resource = get_telemetry_resource()
        logger_provider = LoggerProvider(resource=resource)
        set_logger_provider(logger_provider)
        
        logger_provider.add_log_record_processor(SimpleLogRecordProcessor(ConsoleLogExporter()))
        
        otel_log_handler = LoggingHandler(level=logging.INFO)
        logger.addHandler(otel_log_handler)
        
        otel_log_handler.setFormatter(CustomJSONFormatter())
