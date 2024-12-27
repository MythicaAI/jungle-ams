import json
import logging
import os
import sys
import traceback

from opentelemetry._logs import set_logger_provider
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import (
    OTLPLogExporter,
)
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import (
    BatchLogRecordProcessor,
    ConsoleLogExporter,
    SimpleLogRecordProcessor,
)
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
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
            ResourceAttributes.K8S_NAMESPACE_NAME: os.getenv("NAMESPACE", "api-dev"),
            ResourceAttributes.SERVICE_NAMESPACE: os.getenv("NAMESPACE", "api-dev"),
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT: os.getenv(
                "NAMESPACE", "local"
            ),
        }
    )


def configure_logging():
    # Skip if pytest is running
    if "pytest" in sys.argv[0] or "pytest" in sys.modules:
        print("logging disabled under pytest")
        return

    logger = logging.getLogger()
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    if app_config().telemetry_enable:
        logger.handlers.clear()

        #
        # Metadata and access configuration
        #
        resource = get_telemetry_resource()
        headers = [('signoz-access-token', app_config().telemetry_token)]

        #
        # OpenTelemetry Tracer configuration
        #
        tracer_provider = TracerProvider(resource=resource)
        set_tracer_provider(tracer_provider)
        span_exporter = OTLPSpanExporter(
            endpoint=app_config().telemetry_endpoint,
            insecure=app_config().telemetry_insecure,
            headers=headers,
        )
        tracer_provider.add_span_processor(SimpleSpanProcessor(span_exporter))

        #
        # OpenTelemetry Metrics configuration
        #
        metric_exporter = OTLPMetricExporter(
            endpoint=app_config().telemetry_endpoint,
            insecure=app_config().telemetry_insecure,
            headers=headers,
        )
        reader = PeriodicExportingMetricReader(
            metric_exporter
        )
        meterProvider = MeterProvider(metric_readers=[reader], resource=resource)
        metrics.set_meter_provider(meterProvider)

        #
        # OpenTelemetry Logging Exporter
        #
        logger_provider = LoggerProvider(resource=resource)
        set_logger_provider(logger_provider)
        exporter = OTLPLogExporter(
            endpoint=app_config().telemetry_endpoint,
            insecure=app_config().telemetry_insecure,
            headers=headers,
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
