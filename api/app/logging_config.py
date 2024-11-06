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
        original_msg = record.msg
        original_args = record.args

        if original_args:
            record.msg = original_msg % original_args

        # Build the JSON log entry
        log_entry = {
            "message": record.msg,
            "level": record.levelname,
            "time": self.formatTime(record),
        }

        log_entry.update(
            {
                k: v
                for k, v in record.__dict__.items()
                if k not in ['msg', 'args', 'levelname', 'asctime', 'message']
            }
        )

        json_log_entry = json.dumps(log_entry)

        record.msg = original_msg

        return json_log_entry


def configure_logging():
    if app_config().enable_otel:
        tracer_provider = TracerProvider()
        set_tracer_provider(tracer_provider)
        tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

        logger_provider = LoggerProvider()
        set_logger_provider(logger_provider)

        exporter = OTLPLogExporter(endpoint="localhost:4317", insecure=True)
        logger_provider.add_log_record_processor(BatchLogRecordProcessor(exporter))

        logging.basicConfig(level=logging.INFO)
        otel_log_handler = LoggingHandler(level=logging.INFO)
        logging.getLogger().addHandler(otel_log_handler)

        for handler in logging.getLogger().handlers:
            handler.setFormatter(CustomJSONFormatter())
    else:
        # Default logging configuration without OpenTelemetry
        logging.basicConfig(level=logging.INFO, format="%(message)s")
        logger = logging.getLogger()
        for handler in logger.handlers:
            handler.setFormatter(CustomJSONFormatter())
