import logging
import os
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
from ripple.config import get_telemetry_resource


def init_telemetry():
    resource = get_telemetry_resource()
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

    otel_log_handler = LoggingHandler(level=logging.DEBUG)
    logger = logging.getLogger()
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    logger.addHandler(otel_log_handler)
