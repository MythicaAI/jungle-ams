# Stage 1: Base Python image with Poetry
FROM python:3.11-slim AS base

# Install Poetry
RUN apt-get update && apt-get install -y curl

# Copy files
COPY . /app

# Set working directory
WORKDIR /app
RUN pip install --no-cache-dir -r /app/requirements.txt

ENTRYPOINT ["/usr/local/bin/python", "workers.py"]
