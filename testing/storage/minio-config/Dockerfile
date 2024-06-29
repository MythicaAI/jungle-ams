FROM minio/minio
LABEL maintainer="jacobrepp@gmail.com"
LABEL version="1.0.0"
LABEL name="minio-config"
LABEL description="Configures minio after service is available"
LABEL tier="storage"

WORKDIR /
COPY ./docker-entrypoint.sh .
ENTRYPOINT ["./docker-entrypoint.sh"]
