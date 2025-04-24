ARG LIBS_PYTHON_IMAGE=mythica-libs-python
FROM ${LIBS_PYTHON_IMAGE} AS libs-python-image

LABEL maintainer="pedro@mythica.ai"
LABEL name="mythica-auto-blender"
LABEL description="Automation for mythica blender services"
LABEL version="1.0.0"
LABEL tier="auto"


# Use the NVidia CUDA base image
FROM nvcr.io/nvidia/cuda:12.6.0-base-ubuntu22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PATH="/usr/local/bin:$PATH"

# Default for local (docker compose) mode, override in deployment
ENV NATS_ENDPOINT="nats://nats:4222"
ENV MYTHICA_ENVIRONMENT=dev
ENV DISCORD_INFRA_ALERTS_WEBHOOK=localhost
ENV MYTHICA_LOCATION=localhost
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=automation-blender"
ENV TELEMETRY_ENDPOINT=grpc://collector:4317
ENV K8S_CLUSTER_NAME=localhost

# Install Python 3.11 and dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        software-properties-common && \ 
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        python3.11 python3.11-venv python3.11-dev python3-pip libx11-6 && \
    apt-get install -y \
        libopenexr-dev \ 
        bzip2 \ 
        build-essential \ 
        zlib1g-dev \ 
        libxmu-dev \ 
        libxi-dev \ 
        libxxf86vm-dev \ 
        libfontconfig1 \ 
        libxrender1 \ 
        libgl1-mesa-glx \ 
        libxkbcommon-x11-0 \
        xz-utils &&\
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


COPY --from=libs-python-image /libs/python /libs/python

# Copy monorepo dependencies
COPY . /app

WORKDIR /app

# Ensure pip is up-to-date
RUN python3.11 -m pip install \
    --upgrade \
    --no-cache-dir pip poetry

# Install everything into the python site-packages, these
# will be referenced later to build the houdini site-packages
RUN poetry config --local virtualenvs.create false
RUN poetry install --only main,infra --no-root --no-cache
ENV API_BASE_URI=http://app:5555/v1

ENTRYPOINT ["poetry", "run", "python3.11", "workers.py"]
