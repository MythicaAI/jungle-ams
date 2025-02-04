from fastapi import Request
from opentelemetry import trace
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator


tracer = trace.get_tracer(__name__)


def propagate_telemetry_context(func):
    "Propagates telemetry context from headers to root"
    def wrapper(*args, **kwargs):
        request: Request = args[1]
        context = TraceContextTextMapPropagator().extract(carrier=dict(request.headers))
        with tracer.start_as_current_span("request", context=context):
            result = func(*args, **kwargs)
        return result
    return wrapper
