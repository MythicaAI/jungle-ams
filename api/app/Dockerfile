# Basic python runtime. Worth updating at some point
FROM python:3.12-alpine

WORKDIR /app

# Express this dependency first, to aid in layer caching
COPY Pipfile .
COPY Pipfile.lock .

# Run all dependent installs before application code layer
RUN pip install --upgrade pip poetry
RUN poetry install --system --deploy

# Create the uploads folder
USER 0
RUN mkdir -p /uploads

# Application server listen port, see ./docker-entrypoint.sh
EXPOSE 5555

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Put all application data into the container /app directory, do this as late
# as possible to aid in the docker layer cache coherency
COPY . /app

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Creates a non-root user and adds permission to access the /app folder
RUN adduser -u 5678 --disabled-password --gecos "" appuser && \
    chown -R appuser /app && \
    chown -R appuser /uploads
USER appuser

# Expose SQL connection using the environment variable
ENV SQL_URL postgresql://test:test@postgres:5432/upload_pipeline

CMD ["/docker-entrypoint.sh"]
