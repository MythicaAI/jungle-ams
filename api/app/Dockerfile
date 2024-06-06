# Basic python runtime. Worth updating at some point
FROM python:3.12-alpine

WORKDIR /app

# Express this dependency first, to aid in layer caching
COPY requirements.txt .

# Run all dependent installs before application code layer
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
CMD ["/docker-entrypoint.sh"]

# Create the uploads folder
USER 0
RUN mkdir -p /uploads
USER $CONTAINER_USER_ID

# Application server listen port, see ./docker-entrypoint.sh
EXPOSE 5555

# Put all application data into the container /app directory, do this as late
# as possible to aid in the docker layer cache coherency
COPY . /app

ENV SQL_URL postgresql://test:test@postgres:5432/upload_pipeline
