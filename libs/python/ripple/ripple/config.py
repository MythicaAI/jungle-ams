import functools
import json
import logging
import os
import traceback
from typing import Optional

from opentelemetry import metrics
from opentelemetry._logs import set_logger_provider
from opentelemetry.context import get_current as get_current_telemetry_context
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.propagate import inject
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import (
    BatchLogRecordProcessor,
    ConsoleLogExporter,
    SimpleLogRecordProcessor,
)
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import OTELResourceDetector, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.trace import set_tracer_provider
from pydantic_settings import BaseSettings


class RippleConfig(BaseSettings):
    """Configuration of the ripple library from environment or otherwise"""
    ripple_token_secret_key: str = 'X' * 32  # shared secret for auth token generation
    api_base_uri: str = 'http://localhost:5555/v1'
    mythica_environment: str = "debug"
    telemetry_enable: bool = False
    telemetry_insecure: bool = True
    telemetry_endpoint: str = "otel-sidecar:4317"


@functools.lru_cache
def ripple_config() -> RippleConfig:
    """Get the current cached application config"""
    return RippleConfig()


def update_headers_from_context() -> dict:
    updated_headers = {}
    inject(updated_headers, get_current_telemetry_context())
    return updated_headers


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
    # OpenTelemetry Metrics configuration
    #
    metric_exporter = OTLPMetricExporter(
        endpoint=telemetry_endpoint,
        insecure=telemetry_insecure,
        headers=headers,
    )
    reader = PeriodicExportingMetricReader(metric_exporter, export_interval_millis=500)
    meterProvider = MeterProvider(metric_readers=[reader], resource=resource)
    metrics.set_meter_provider(meterProvider)

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
    if ripple_config().mythica_environment == "debug":
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

