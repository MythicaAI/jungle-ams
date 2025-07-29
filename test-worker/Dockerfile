FROM python:3.13.5-alpine

LABEL maintainer="jacobrepp@gmail.com"
LABEL name="test-worker"
LABEL description="Simple worker test validation"
LABEL version="1.0.0"
LABEL tier="auto"

# Default for local (docker compose) mode, override in deployment
ARG NATS_ENDPOINT="nats://nats:4222"
ENV NATS_ENDPOINT=${NATS_ENDPOINT}

# Copy local application files
COPY . /app

# Set working directory
WORKDIR /app

RUN python -m pip install \
    --root-user-action=ignore \
    --upgrade \
    --no-cache-dir pip uv

RUN uv sync --no-sources --compile-bytecode \
    && source .venv/bin/activate

ENV TELEMETRY_ENDPOINT=grpc://otel-sidecar:4317
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=automation-test"
ENV K8S_CLUSTER_NAME=localhost
ENV API_BASE_URI=http://app:5555/v1

ENTRYPOINT ["python", "workers.py"]
