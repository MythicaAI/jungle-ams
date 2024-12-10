import os
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
)
from opentelemetry.semconv.resource import ResourceAttributes
from opentelemetry.trace import set_tracer_provider
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

def init_tracer_provider():
    tracer_provider = TracerProvider(resource=Resource.create(
        {
            ResourceAttributes.SERVICE_NAME: "houdini",
            ResourceAttributes.K8S_NAMESPACE_NAME: os.getenv("NAMESPACE", "automation-dev"),
            ResourceAttributes.SERVICE_NAMESPACE: os.getenv("NAMESPACE", "automation-dev"),
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT: os.getenv(
                "NAMESPACE", "local"
            ),
        }
    ))
    set_tracer_provider(tracer_provider)
    span_exporter = OTLPSpanExporter(
        endpoint="http://otel-collector.default:4317",
        insecure=True,
    )
    tracer_provider.add_span_processor(BatchSpanProcessor(span_exporter))

