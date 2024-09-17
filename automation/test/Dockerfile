FROM mythica-auto-worker:latest AS worker

# Stage 1: Base Python image with Poetry
FROM python:3.11-slim AS poetry-base

# Install Poetry
RUN apt-get update && apt-get install -y curl pipx && \ 
    pipx ensurepath
ENV PATH="/root/.local/bin:$PATH"

# Copy files
COPY . /app

# Set working directory
WORKDIR /app

# Install dependencies using Poetry (for both worker and project)
RUN pipx install poetry && poetry install --no-root

# Overlay worker
COPY --from=worker /app/requirements_worker.txt /app/requirements_worker.txt
RUN pip install --no-cache-dir -r /app/requirements_worker.txt

COPY --from=worker /app/worker.py /app/worker.py
