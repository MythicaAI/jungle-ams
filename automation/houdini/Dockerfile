ARG LIBS_PYTHON_IMAGE=mythica-libs-python
ARG HOUDINI_VERSION=20.5.370

# Image for monorepo library dependencies
FROM ${LIBS_PYTHON_IMAGE} AS libs-python-image

# Gather python dependencies - do the worker deps here too.
# this version of python should match the target version in Houdini
FROM python:3.11-slim AS python-dependency-downloader

LABEL maintainer="pedro@mythica.ai"
LABEL name="mythica-auto-houdini"
LABEL description="Automation for mythica gen aiservices"
LABEL version="1.0.0"
LABEL tier="auto"

# Copy monorepo dependencies
COPY --from=libs-python-image /libs/python /libs/python

WORKDIR /python-install

COPY pyproject.toml .
COPY poetry.lock .

# Install updated bootstrapping packages for poetry and pip 
RUN python -m pip install \
    --root-user-action=ignore \
    --upgrade \
    --no-cache-dir pip poetry

# Install everything into the python site-packages, these
# will be referenced later to build the houdini site-packages
RUN poetry config --local virtualenvs.create false
RUN poetry install --only main,infra --no-root --no-cache

# Build the primary image from upstream hbuild
FROM aaronsmithtv/hbuild:${HOUDINI_VERSION}-base

# Install and update system dependencies
RUN apt-get update && apt-get install -y wget systemd \
    && rm -rf /var/lib/apt/lists/*

# Default for local (docker compose) mode, override in deployment
ENV NATS_ENDPOINT="nats://nats:4222"
ENV MYTHICA_ENVIRONMENT=dev
ENV MYTHICA_LOCATION=localhost
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=automation-houdini"
ENV K8S_CLUSTER_NAME=localhost

# Make sure that hython is in the path
ENV PATH=/opt/houdini/build/bin:$PATH

# Setup Houdini environment
ENV SFX_CLIENT_ID=""
ENV SFX_CLIENT_SECRET=""



RUN mkdir -p /root/houdini20.5/packages/

RUN mkdir /app

# Install SideFX Labs Houdini Package
ENV SIDE_FX_LABS_VERSION=20.5.370

RUN mkdir /app/sideFXLabs/
RUN wget https://github.com/sideeffects/SideFXLabs/archive/refs/tags/${SIDE_FX_LABS_VERSION}.tar.gz -O /tmp/sideFXLabs.tar.gz
RUN tar -xzf /tmp/sideFXLabs.tar.gz -C /app/sideFXLabs/ --strip-components=1
RUN rm /tmp/sideFXLabs.tar.gz

RUN cp /app/sideFXLabs/SideFXLabs.json /root/houdini20.5/packages/SideFXLabs.json
RUN sed -i 's|"$HOUDINI_PACKAGE_PATH/SideFXLabs20.5"|"/app/sideFXLabs"|g' /root/houdini20.5/packages/SideFXLabs.json

# Copy application code over
COPY . /app

# Install darol plugin 
COPY --from=python-dependency-downloader /libs/python /libs/python
COPY --from=python-dependency-downloader /usr/local/lib/python3.11/site-packages /darol/site-packages
RUN cp /app/darol-plugin/darol.json /root/houdini20.5/packages/darol.json
RUN sed -i 's|"/path/to/darol/repoclone/houdini-package"|"/app/darol-plugin"|g' /root/houdini20.5/packages/darol.json
RUN sed -i 's|"/path/to/python/Lib/site-packages"|"/darol/site-packages"|g' /root/houdini20.5/packages/darol.json


WORKDIR /app

ENTRYPOINT ["/bin/bash", "houdini.sh"]
