# Basic python runtime. Worth updating at some point
FROM python:3.12-alpine

# Create the uploads folder
USER 0
RUN mkdir -p /uploads

WORKDIR /app

# Run all dependent installs before application code layer
RUN pip install --upgrade pip poetry

# Creates a non-root user and adds permission to access the /app folder
RUN adduser -u 5678 --disabled-password --gecos "" appuser && \
    chown -R appuser /app && \
    chown -R appuser /uploads

USER appuser

# Put all application data into the container /app directory, do this as late
# as possible to aid in the docker layer cache coherency
COPY . /app

# Run poetry as the app user to activate the virtual environment
RUN poetry check && \
    poetry env use python3 && \
    poetry install --compile --all-extras --without=dev --no-root

# Application server listen port, see ./docker-entrypoint.sh
EXPOSE 5555

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Env config and defaults
ENV HTTP_LISTEN_ADDR 0.0.0.0
ENV HTTP_LISTEN_PORT 5555
ENV WORKER_COUNT 3

# Expose SQL connection using the environment variable
ENV SQL_URL postgresql://test:test@postgres:5432/upload_pipeline

CMD ["sh", "./docker-entrypoint.sh"]
