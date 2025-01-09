# Build the packager image from the api app image
# TODO: remove these internal dependencies
ARG API_APP_IMAGE=mythica-app
FROM ${API_APP_IMAGE} AS api-app-image

LABEL maintainer="jacobrepp@gmail.com"
LABEL version="1.0.0"
LABEL name="mythica-packager"
LABEL description="Automates the packaging of asset versions"
LABEL tier="automation"

ENV PYTHONPATH=/api/app

WORKDIR /api/packager

# Copy local files
COPY . .

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1
ENV OTEL_RESOURCE_ATTRIBUTES="service.name=packager"
ENV K8S_CLUSTER_NAME=localhost

# Connect to the postgres on the storage network (must have storage network
# attached or available, replace this URL to address a different database
ENV SQL_URL='postgresql+asyncpg://test:test@postgres:5432/upload_pipeline'

ENV PACKAGER_ENDPOINT=http://app:5555

# Entrypoint to bootstrap the published content
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]