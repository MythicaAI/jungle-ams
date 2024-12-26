ARG LIBS_PYTHON_IMAGE=mythica-libs-python
FROM ${LIBS_PYTHON_IMAGE} AS libs-python-image

# Stage 1: python 3.11 base image
FROM python:3.11-slim AS base

LABEL maintainer="pedro@mythica.ai"
LABEL name="mythica-auto-test"
LABEL description="Automation for mythica automation test image"
LABEL version="1.0.0"
LABEL tier="auto"

# Default for local (docker compose) mode, override in deployment
ENV NATS_ENDPOINT="nats://nats:4222"

# Install Poetry
RUN apt-get update && apt-get install -y curl

# Copy monorepo dependencies
COPY --from=libs-python-image /libs/python /libs/python

# Copy local application files
COPY . /app

# Set working directory
WORKDIR /app
RUN python -m pip install \
    --root-user-action=ignore \
    --upgrade \
    --no-cache-dir pip poetry

RUN poetry config --local virtualenvs.create false
RUN poetry install --only main,infra --no-root --no-cache

ENTRYPOINT ["/usr/local/bin/python", "workers.py"]
