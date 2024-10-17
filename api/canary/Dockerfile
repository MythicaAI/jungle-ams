FROM python:3.12-alpine
LABEL version="1.0.0"
LABEL name="mythica-canary"
LABEL description="Automated canary test for the job pipeline"
LABEL tier="automation"

WORKDIR /api/canary

# Copy local files
COPY . .

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

ENV SERVICE_ENDPOINT=http://app:5555

# Entrypoint to bootstrap the published content
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]