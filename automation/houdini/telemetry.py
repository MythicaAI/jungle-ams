import os
from ripple.config import configure_telemetry


def init_telemetry():
    configure_telemetry(
        os.getenv("TELEMETRY_ENDPOINT", "http://otel-collector.default:4317"),
        os.getenv("TELEMETRY_INSECURE", "true") == "true",
    )
