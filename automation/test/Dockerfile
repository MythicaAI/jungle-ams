ARG LIBS_PYTHON_IMAGE=mythica-libs-python
FROM ${LIBS_PYTHON_IMAGE} AS libs-python-image

# Stage 1: python 3.11 base image
FROM python:3.11-slim AS base

# Install Poetry
RUN apt-get update && apt-get install -y curl

# Copy monorepo dependencies
COPY --from=libs-python-image /libs/python /libs/python

# Copy local application files
COPY . /app

# Set working directory
WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["/usr/local/bin/python", "workers.py"]
