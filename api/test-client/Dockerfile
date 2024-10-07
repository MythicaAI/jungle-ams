# Basic python runtime. Worth updating at some point
FROM python:3.12-alpine AS poetry-base
LABEL maintainer="jacobrepp@gmail.com"
LABEL name="mythica-test-client"
LABEL description="API service for mythica asset version managment"
LABEL version="1.0.0"
LABEL tier="web"

# Create the uploads folder
USER 0
RUN mkdir -p /uploads
RUN mkdir -p /app/test-client

WORKDIR /app/test-client

# Creates a non-root user and adds permission to access the /app folder
RUN adduser -u 5678 --disabled-password --gecos "" appuser && \
    chown -R appuser /app/test-client

# Run all dependent installs as root before application 
# code layer, if not done as root the poetry scripts are not 
# installed into /usr/local/bin
RUN pip install --upgrade pip
RUN pip install poetry

USER appuser

FROM poetry-base

# Put all application data into the container /app directory, do this as late
# as possible to aid in the docker layer cache coherency
COPY /api/test-client /app/test-client
COPY /libs/python/mythica-api-client /libs/python/mythica-api-client

# Run poetry as the app user to activate the virtual environment
RUN poetry check && \
    poetry env use python3 && \
    poetry install --compile --all-extras --without=dev --no-root

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Env config and defaults
ENV API_BASE_URI=http://localhost:50555/v1

CMD ["python", "main.py"]
