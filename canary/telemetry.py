# copy from libs/python/meshwork/meshwork/config.py
import json
import logging
import os
import traceback
from typing import Optional
from urllib.parse import urlparse

from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import (
    BatchLogRecordProcessor,
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


def is_secure_scheme(url):
    """Test URL for supported secure schemes"""
    parsed_url = urlparse(url)
    secure_schemes = {'https', 'wss', 'grpcs'}
    return parsed_url.scheme.lower() in secure_schemes


def configure_telemetry(endpoint: Optional[str]):
    logger = logging.getLogger()
    insecure = not is_secure_scheme(endpoint)
    logger.info("Telemetry enabled. telemetry_endpoint: %s", endpoint)
    if insecure:
        logger.warning("Telemetry using insecure scheme", )
    logger.handlers.clear()
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    logger = logging.getLogger()
    logger.info(
        "Telemetry enabled. telemetry_endpoint: %s", endpoint,
    )
    logger.handlers.clear()
    logging.basicConfig(level=logging.INFO, format="%(message)s")

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
        endpoint=endpoint,
        insecure=insecure,
        headers=None,
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
        headers=None,
    )
    logger_provider.add_log_record_processor(BatchLogRecordProcessor(exporter))

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
