FROM mythica-app:latest AS api

FROM hautomation:latest
LABEL maintainer="jacobrepp@gmail.com"
LABEL version="1.0.0"
LABEL name="mythica-houdini-worker"
LABEL description="Automates the packaging of asset versions"
LABEL tier="automation"

# Build the requirements layer first, it shouldn't be changing very often
# RUN pip install --upgrade pip google-cloud-storage

# Install system dependencies
RUN apt-get update && apt-get install -y python3-poetry python3-trove-classifiers \
    && rm -rf /var/lib/apt/lists/*

# Copy API from the mythica app image for the packager to interface
COPY --from=api /app /app/api
ENV PYTHONPATH=/app/api

WORKDIR /app/api
RUN poetry check && \
    poetry env use python3 && \
    poetry install --all-extras --no-root

WORKDIR /app

# Copy local files
COPY . .

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Connect to the postgres on the storage network (must have storage network
# attached or available, replace this URL to address a different database
ENV SQL_URL='postgresql+asyncpg://test:test@postgres:5432/upload_pipeline'

ENV SERVICE_ENDPOINT=http://app:5555

# Entrypoint to bootstrap the published content
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]