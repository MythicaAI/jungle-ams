import json
import logging
import os
import traceback
from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import (
    OTLPLogExporter,
)
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import SimpleLogRecordProcessor

from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.trace import set_tracer_provider


def init_telemetry():
    resource = Resource.create(
        {
            ResourceAttributes.SERVICE_NAME: "houdini",
            ResourceAttributes.K8S_NAMESPACE_NAME: os.getenv(
                "NAMESPACE", "automation-dev"
            ),
            ResourceAttributes.SERVICE_NAMESPACE: os.getenv(
                "NAMESPACE", "automation-dev"
            ),
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT: os.getenv("NAMESPACE", "local"),
        }
    )
    endpoint = os.getenv("TELEMETRY_ENDPOINT", "http://otel-collector.default:4317")
    insecure = os.getenv("TELEMETRY_INSECURE", "true") == "true"

    #
    # OpenTelemetry Tracer configuration
    #
    tracer_provider = TracerProvider(resource=resource)
    set_tracer_provider(tracer_provider)
    span_exporter = OTLPSpanExporter(
        endpoint=endpoint,
        insecure=insecure,
    )
    tracer_provider.add_span_processor(SimpleSpanProcessor(span_exporter))

    #
    # OpenTelemetry Logging Exporter
    #
    logger_provider = LoggerProvider(resource=resource)
    set_logger_provider(logger_provider)
    exporter = OTLPLogExporter(
        endpoint=endpoint,
        insecure=insecure,
    )
    logger_provider.add_log_record_processor(SimpleLogRecordProcessor(exporter))

    otel_log_handler = LoggingHandler(level=logging.INFO)
    logger = logging.getLogger()
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    logger.addHandler(otel_log_handler)

    otel_log_handler.setFormatter(CustomJSONFormatter())


class CustomJSONFormatter(logging.Formatter):
    def format(self, record):
        record_message = record.getMessage()

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
