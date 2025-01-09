FROM python:3.12-alpine

LABEL maintainer="jacobrepp@gmail.com"
LABEL name="mythica-libs-python"
LABEL description="Base image with libraries and poetry"
LABEL version="1.0.0"
LABEL tier="web"

# Run all dependent installs as root before application
# code layer, if not done as root the poetry scripts are not
# installed into /usr/local/bin
RUN pip install --upgrade pip
RUN pip install poetry==1.8.5

# Copy libraries to the /libs/python folder for consistent
# referencing by other project in the infra monorepo
COPY ripple /libs/python/ripple
COPY cryptid /libs/python/cryptid

# Create a default non-root user
RUN adduser -u 5678 --disabled-password --gecos "" appuser