FROM mythica-app:latest AS api

# Build the packager image from the alpine python distro
FROM python:3.12-alpine
LABEL maintainer="jacobrepp@gmail.com"
LABEL version="1.0.0"
LABEL name="mythica-packager"
LABEL description="Automates the packaging of asset versions"
LABEL tier="automation"

# Build the requirements layer first, it shouldn't be changing very often
# RUN pip install --upgrade pip google-cloud-storage



# Copy API from the mythica app image for the packager to interface
COPY --from=api /api /api
COPY --from=api /libs /libs
ENV PYTHONPATH=/api/app

WORKDIR /api/app
RUN pip install --upgrade pip poetry
RUN poetry check && \
    poetry env use python3 && \
    poetry install --compile --all-extras --without=dev --no-root

WORKDIR /api/packager

# Copy local files
COPY . .

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Connect to the postgres on the storage network (must have storage network
# attached or available, replace this URL to address a different database
ENV SQL_URL='postgresql+asyncpg://test:test@postgres:5432/upload_pipeline'

ENV PACKAGER_ENDPOINT=http://app:5555

# Entrypoint to bootstrap the published content
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]