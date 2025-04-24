ARG LIBS_PYTHON_IMAGE=mythica-libs-python
FROM ${LIBS_PYTHON_IMAGE} AS libs-python-image

FROM python:3.12-alpine AS base

LABEL maintainer="pedro@mythica.ai"
LABEL name="mythica-auto-imagemagick"
LABEL description="Automation for mythica automation test image"
LABEL version="1.0.0"
LABEL tier="auto"

# Install Python, pip, ImageMagick and its dependencies, and ffmpeg for video processing
RUN apk add --no-cache \
    python3 \
    py3-pip \
    imagemagick \
    imagemagick-dev \
    ffmpeg \
    gcc \
    python3-dev \
    musl-dev \
    # Libraries needed for Pillow/ImageMagick integration
    jpeg-dev \
    zlib-dev \
    freetype-dev \
    lcms2-dev \
    openjpeg-dev \
    tiff-dev \
    tk-dev \
    tcl-dev

# Configure ImageMagick policies to allow video formats and larger images
RUN mkdir -p /etc/ImageMagick-7 && \
    echo '<policymap> \
    <policy domain="resource" name="memory" value="2GiB"/> \
    <policy domain="resource" name="map" value="4GiB"/> \
    <policy domain="resource" name="width" value="64KP"/> \
    <policy domain="resource" name="height" value="64KP"/> \
    <policy domain="resource" name="disk" value="8GiB"/> \
    </policymap>' > /etc/ImageMagick-7/policy.xml

# Create directories for input and output files
USER 0

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

# Install the poetry dependencies into the local python site-packages
RUN poetry config --local virtualenvs.create false
RUN poetry install --only main,infra --no-root --no-cache

RUN mkdir -p /app/input /app/output

# Create and set working directory
WORKDIR /app

# Copy application code
COPY . .


# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Default for local (docker compose) mode, override in deployment
ENV NATS_ENDPOINT="nats://nats:4222"
ENV MYTHICA_ENVIRONMENT="dev"
ENV DISCORD_INFRA_ALERTS_WEBHOOK=localhost
ENV CRYPTID_LOCATION="localhost"
ENV API_BASE_URI=http://app/v1
ENV TELEMETRY_ENDPOINT=grpc://collector:4317
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=automation-imagemagick"
ENV K8S_CLUSTER_NAME=localhost

# Command to run the worker
CMD ["python3", "workers.py"]
