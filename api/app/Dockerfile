ARG LIBS_PYTHON_IMAGE=mythica-libs-python
FROM ${LIBS_PYTHON_IMAGE} AS libs-python-image

LABEL maintainer="jacobrepp@gmail.com"
LABEL name="mythica-app"
LABEL description="API service for mythica asset version managment"
LABEL version="1.0.0"
LABEL tier="web"

# Create the uploads folder
USER 0
RUN mkdir -p /uploads
RUN mkdir -p /api/app

WORKDIR /api/app

# Fix permissions for the default non-root user
RUN chown -R appuser /api/app && \
    chown -R appuser /uploads

# Put all application data into the container /app directory, do this as late
# as possible to aid in the docker layer cache coherency
COPY . .

# Run poetry as the app user to activate the virtual environment
RUN poetry check && \
    poetry env use python3 && \
    poetry install --compile --all-extras --without=dev --no-root

USER appuser
# Application server listen port, see ./docker-entrypoint.sh
EXPOSE 5555

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Env config and defaults
ENV HTTP_LISTEN_ADDR=0.0.0.0
ENV HTTP_LISTEN_PORT=5555
ENV WORKER_COUNT=3
ENV API_BASE_URI=http://localhost:15555/v1
ENV TELEMETRY_ENABLE=True
ENV TELEMETRY_ENDPOINT=127.0.0.1:4317

# Expose SQL connection using the environment variable
ENV SQL_URL=postgresql://test:test@postgres:5432/upload_pipeline

CMD ["sh", "./docker-entrypoint.sh"]
