# copy from libs/python/ripple/ripple/config.py
import json
import logging
import os
import traceback
from typing import Optional

from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import (
    BatchLogRecordProcessor,
    ConsoleLogExporter,
    SimpleLogRecordProcessor,
)
from opentelemetry.sdk.resources import OTELResourceDetector, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.trace import set_tracer_provider


def get_telemetry_resource() -> Resource:
    detected_resource = OTELResourceDetector().detect()
    
    resource = Resource.create(
        {
            "APP_VERSION": os.getenv("APP_VERSION", "local"),
            "MYTHICA_LOCATION": os.getenv("MYTHICA_LOCATION", "local"),
            ResourceAttributes.K8S_CLUSTER_NAME: os.getenv("K8S_CLUSTER_NAME", "local"),
            ResourceAttributes.K8S_NAMESPACE_NAME: os.getenv(
                "NAMESPACE", "dev"
            ),
            ResourceAttributes.SERVICE_NAMESPACE: os.getenv(
                "NAMESPACE", "dev"
            ),
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT: os.getenv("NAMESPACE", "local"),
        }
    )
    # detected_resource overrides resource with vars from OTEL_RESOURCE_ATTRIBUTES
    resource = resource.merge(detected_resource)

    return resource


def configure_telemetry(telemetry_endpoint: str, telemetry_insecure: bool, headers: Optional[list[tuple]] = None):

    logger = logging.getLogger()
    logger.info(
        "Telemetry enabled. telemetry_endpoint: %s, telemetry_insecure: %s",
        telemetry_endpoint,
        telemetry_insecure,
    )
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    logger.handlers.clear()

    #
    # Metadata and access configuration
    #
    resource = get_telemetry_resource()

    #
    # OpenTelemetry Tracer configuration
    #
    tracer_provider = TracerProvider(resource=resource)
    set_tracer_provider(tracer_provider)
    span_exporter = OTLPSpanExporter(
        endpoint=telemetry_endpoint,
        insecure=telemetry_insecure,
        headers=headers,
    )
    tracer_provider.add_span_processor(SimpleSpanProcessor(span_exporter))

    #
    # OpenTelemetry Logging Exporter
    #
    logger_provider = LoggerProvider(resource=resource)
    set_logger_provider(logger_provider)
    exporter = OTLPLogExporter(
        endpoint=telemetry_endpoint,
        insecure=telemetry_insecure,
        headers=headers,
    )
    logger_provider.add_log_record_processor(BatchLogRecordProcessor(exporter))
    if resource.attributes.get("MYTHICA_LOCATION") == "localhost":
        logger_provider.add_log_record_processor(
            SimpleLogRecordProcessor(ConsoleLogExporter())
        )

    otel_log_handler = LoggingHandler(level=logging.INFO)
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
