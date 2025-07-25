ARG LIBS_PYTHON_IMAGE=jrepp/jungle-ams:libs-python-latest
FROM ${LIBS_PYTHON_IMAGE} AS libs-python-image

LABEL maintainer="jacobrepp@gmail.com"
LABEL name="api"
LABEL description="The Jungle Asset Management API"
LABEL version="1.0.0"
LABEL tier="web"

# Create the uploads folder
USER 0
RUN mkdir -p /uploads
RUN mkdir -p /ams/

WORKDIR /ams/

# Fix permissions for the default non-root user
RUN chown -R appuser /ams/ && \
    chown -R appuser /uploads

USER appuser

# Put all application data into the container /app directory, do this as late
# as possible as possible to aid in the Docker layer cache coherency
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
ENV TELEMETRY_ENDPOINT=grpc://collector:4317
ARG NATS_ENDPOINT="nats://nats:4222"
ENV NATS_ENDPOINT="nats://nats:4222"
ENV MYTHICA_ENVIRONMENT=dev
ENV DISCORD_INFRA_ALERTS_WEBHOOK=localhost
ENV MYTHICA_LOCATION=localhost

ENV OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
ENV OTEL_EXPORTER_OTLP_TRACES_INSECURE=true
ENV ENABLE_GCS_PYTHON_CLIENT_OTEL_TRACES=true
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=api"
ENV K8S_CLUSTER_NAME=localhost

# Expose SQL connection using the environment variable
ENV SQL_URL="postgresql+asyncpg://test:test@postgres:5432/upload_pipeline"

CMD ["sh", "./docker-entrypoint.sh"]
