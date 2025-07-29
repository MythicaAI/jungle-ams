# Use the specified CUDA base image
FROM python:3.12-alpine

LABEL maintainer="pedro@mythica.ai"
LABEL name="genai"
LABEL description="Automation for mythica gen aiservices"
LABEL version="1.0.0"
LABEL tier="auto"

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PATH="/usr/local/bin:$PATH"
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=automation-genai"
ENV TELEMETRY_ENDPOINT=grpc://collector:4317
ENV K8S_CLUSTER_NAME=localhost

# Default for local (docker compose) mode, override in deployment
ENV NATS_ENDPOINT="nats://nats:4222"

# Install Python 3.11 and dependencies
RUN pip install --upgrade pip
RUN pip install poetry==1.8.5
RUN poetry config --local virtualenvs.create false

COPY . /app
WORKDIR /app


# Install everything into the python site-packages, these
# will be referenced later to build the houdini site-packages
RUN poetry install --only main --no-root --no-cache


ENTRYPOINT ["poetry", "run", "python3", "workers.py"]
