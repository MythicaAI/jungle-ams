ARG LIBS_PYTHON_IMAGE=mythica-libs-python
FROM ${LIBS_PYTHON_IMAGE} AS libs-python-image

LABEL maintainer="jacobrepp@gmail.com"
LABEL name="mythica-app"
LABEL description="API service for mythica asset version managment"
LABEL version="1.0.0"
LABEL tier="web"

# Create the uploads folder
USER 0
RUN mkdir -p /uploads
RUN mkdir -p /api/app

WORKDIR /api/app

# Fix permissions for the default non-root user
RUN chown -R appuser /api/app && \
    chown -R appuser /uploads

USER appuser

# Put all application data into the container /app directory, do this as late
# as possible to aid in the docker layer cache coherency
COPY . .

# Run poetry as the app user to activate the virtual environment
RUN poetry check && \
    poetry env use python3 && \
    poetry install --compile --all-extras --without=dev --no-root

# Application server listen port, see ./docker-entrypoint.sh
EXPOSE 5555

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Env config and defaults
ENV ENVIRONMENT=dev
ENV HTTP_LISTEN_ADDR=0.0.0.0
ENV HTTP_LISTEN_PORT=5555
ENV WORKER_COUNT=3
ENV API_BASE_URI=http://localhost:15555/v1
ENV TELEMETRY_ENABLE=True
ENV TELEMETRY_ENDPOINT=otel-sidecar:4317
ENV TELEMETRY_INSECURE=True
ENV NATS_ENDPOINT="nats://nats:4222"
ENV MYTHICA_ENVIRONMENT=dev
ENV MYTHICA_LOCATION=localhost

ENV OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
ENV OTEL_EXPORTER_OTLP_TRACES_INSECURE=true
ENV ENABLE_GCS_PYTHON_CLIENT_OTEL_TRACES=true
#ENV OTEL_RESOURCE_ATTRIBUTES="service.name=api"
#ENV OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.{region}.signoz.cloud:443"
#ENV OTEL_EXPORTER_OLTP_ENDPOINT=http://collector:4317
#ENV OTEL_EXPORTER_OTLP_HEADERS="signoz-access-token=SIGNOZ_INGESTION_KEY"
#ENV OTEL_EXPORTER_OTLP_PROTOCOL=grpc

# Expose SQL connection using the environment variable
ENV SQL_URL=postgresql://test:test@postgres:5432/upload_pipeline

CMD ["sh", "./docker-entrypoint.sh"]
