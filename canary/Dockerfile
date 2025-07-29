FROM python:3.12-alpine
LABEL version="1.0.0"
LABEL name="canary"
LABEL description="Automated canary test for the job pipeline"
LABEL tier="web"

RUN pip install --upgrade pip && \
    pip install requests opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp

WORKDIR /ams/canary

# Copy local files
COPY . .

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=canary"
ENV MYTHICA_ENVIRONMENT=dev
ENV MYTHICA_LOCATION=localhost
ENV TELEMETRY_ENDPOINT=grpc://collector:4317
ENV K8S_CLUSTER_NAME=localhost

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

ENV MYTHICA_ENDPOINT=http://app:5555
ENV MYTHICA_API_KEY=""

# Entrypoint to bootstrap the published content
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
